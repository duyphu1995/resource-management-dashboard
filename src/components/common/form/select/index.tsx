import { Select as AntSelect, Checkbox, Input, SelectProps, Space, Tag, Tooltip } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import { ChangeEvent, useEffect, useState } from 'react';
import SearchIcon from '/media/icons/search-gray.svg';
import TagCloseIcon from '/media/icons/tag-close-gray.svg';

export interface ISelectProps extends SelectProps {
    searchPlaceholder?: string;
    isShowOptionAll?: boolean;
}

const BaseSelect = (props: ISelectProps) => {
    const {
        value,
        placeholder,
        onChange,
        children,
        mode,
        maxTagCount,
        allowClear = true,
        options,
        optionFilterProp = 'label',
        optionLabelProp = 'label',
        filterSort,
        searchPlaceholder = 'Search',
        getPopupContainer: getPopupContainerProp,
        isShowOptionAll,
        dropdownStyle,
        ...otherProps
    } = props;

    const [isMaxTagCount, setIsMaxTagCount] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [isSelectedAllOptions, setIsSelectAllOptions] = useState<boolean>(false);

    const onChangeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    // Update current value when value is changed
    const [currentValue, setCurrentValue] = useState(value);
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    // Check all options
    useEffect(() => {
        const selectedAllOptions = Array.isArray(currentValue) && currentValue.length === options?.length;
        if (!selectedAllOptions) setIsMaxTagCount(typeof maxTagCount === 'number' ? maxTagCount : 1);
        else setIsMaxTagCount(0);
        setIsSelectAllOptions(selectedAllOptions);
    }, [currentValue, options, maxTagCount]);

    // Handle change current value
    const onChangeCurrentValue = (value: any, option: DefaultOptionType | DefaultOptionType[]) => {
        if (mode === 'multiple' || mode === 'tags') value = value?.filter((item: any) => item !== 'All');

        setCurrentValue(value);
        if (onChange) onChange(value, option);
    };

    // Handle click option all
    const onSelectAll = () => {
        if (isSelectedAllOptions) {
            setCurrentValue(undefined);

            // If onChange props then call onChange
            if (onChange) onChange(undefined, []);
        } else {
            // Set new value = all values of options
            const newValue = options?.map(option => option.value);
            setCurrentValue(newValue);

            // If onChange props then call onChange
            if (onChange) onChange(newValue, []);
        }
    };

    // Render dropdown
    // When options length or children length > 5 then show search input and options all (for multiple mode)
    const currentDropdownRender = (menu: any) => {
        const childrenLength = Array.isArray(children) ? children.length : 0;
        const optionsLength = Array.isArray(options) ? options.length : 0;

        return (
            <div style={dropdownStyle}>
                <>
                    {(childrenLength > 5 || optionsLength > 5) && (
                        <Input
                            size="small"
                            className="select-search"
                            allowClear
                            addonBefore={<img src={SearchIcon} alt="icon" />}
                            placeholder={searchPlaceholder}
                            value={keyword}
                            onChange={onChangeKeyword}
                        />
                    )}
                    {(((mode === 'multiple' || mode === 'tags') && (childrenLength > 5 || optionsLength > 5)) || isShowOptionAll) && (
                        <div className="select-option-all" onClick={onSelectAll}>
                            <Space>
                                <Checkbox checked={isSelectedAllOptions} />
                                All
                            </Space>
                        </div>
                    )}
                </>
                {menu}
            </div>
        );
    };

    const onCurrentDropdownVisibleChange = () => {
        setKeyword('');
    };

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    // Render tag for multiple mode
    // Show tool tip for tag value
    const currentTagRender = (tag: DefaultOptionType) => {
        const { label, closable, onClose } = tag;

        return !isSelectedAllOptions ? (
            <Tag onMouseDown={onPreventMouseDown} closeIcon={<img src={TagCloseIcon} />} closable={closable} onClose={onClose}>
                <Tooltip title={label} trigger="hover">
                    {label}
                </Tooltip>
            </Tag>
        ) : (
            <Tag onMouseDown={onPreventMouseDown} closeIcon={<img src={TagCloseIcon} />} onClose={onSelectAll}>
                All
            </Tag>
        );
    };

    // Render tag count
    // Show hidden label with tooltip
    const currentMaxTagPlaceholder = (values: any) => {
        return !isSelectedAllOptions || (options?.length || 0) <= 5 ? (
            <Tooltip title={values.map((value: any) => value.label).join(', ')} trigger="hover" className="tag-count">
                +{values.length}
            </Tooltip>
        ) : (
            <div className="tag-count"></div>
        );
    };

    const defaultFilterSort = (optionA: DefaultOptionType, optionB: DefaultOptionType) => {
        // Get lowercase string representation of labels (default to empty string if undefined or null)
        const labelA = (optionA?.label?.toString() ?? '').toLowerCase();
        const labelB = (optionB?.label?.toString() ?? '').toLowerCase();

        // Check if both labels are numeric
        if (!isNaN(parseFloat(labelA)) && !isNaN(parseFloat(labelB))) {
            // If both are numbers, perform numeric comparison
            return parseFloat(labelA) - parseFloat(labelB);
        }

        // If not both numeric, perform string comparison
        return labelA.localeCompare(labelB);
    };

    const currentFilterSort = filterSort ?? defaultFilterSort;

    const dynamicProps: SelectProps = {
        mode: mode,
        /* Value */
        value: currentValue,
        allowClear: allowClear,
        onChange: onChangeCurrentValue,
        /* Options */
        options: undefined,
        optionLabelProp: optionLabelProp,
        optionFilterProp: optionFilterProp,
        filterSort: currentFilterSort,
        onDropdownVisibleChange: onCurrentDropdownVisibleChange
    };

    const blockedProps: SelectProps = {
        placeholder: '', // Use custom placeholder
        /* Search */
        searchValue: keyword,
        showSearch: false,
        /* Tag */
        tagRender: currentTagRender,
        maxTagCount: isMaxTagCount,
        maxTagPlaceholder: currentMaxTagPlaceholder,
        /* Dropdown */
        dropdownRender: currentDropdownRender,
        getPopupContainer: getPopupContainerProp ?? (triggerNode => triggerNode.parentNode)
    };

    // Options JSX
    const optionsJSX =
        Array.isArray(options) && options.length > 0
            ? options.map((option, index) => (
                  <Option
                      key={`${option.value}_${index}`}
                      value={option.value}
                      label={option.label}
                      disabled={option.disabled || false}
                      flagTransfer={option.flagTransfer || ''}
                      flagDisableTransfer={option.flagDisableTransfer || ''}
                  >
                      <Space style={{ color: option.flagDisableTransfer === 1 ? '#00a1e4' : '' }}>
                          {(mode === 'multiple' || mode === 'tags') && (
                              <Checkbox
                                  checked={currentValue?.length ? currentValue?.find((item: any) => item === option.value) !== undefined : false}
                              />
                          )}
                          {option.label}
                      </Space>
                  </Option>
              ))
            : children;

    return (
        <div className="select-container">
            {placeholder && !currentValue?.toString() && <div className="select-selection-placeholder">{placeholder}</div>}
            <AntSelect {...dynamicProps} {...otherProps} {...blockedProps}>
                {optionsJSX}
            </AntSelect>
        </div>
    );
};

const { Option } = AntSelect;
export default BaseSelect;
