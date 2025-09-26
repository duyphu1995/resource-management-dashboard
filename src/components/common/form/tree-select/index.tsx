import { TreeSelect as AntTreeSelect, Checkbox, Input, Space, Tag, Tooltip, TreeSelectProps } from 'antd';
import { ChangeEvent, useEffect, useState } from 'react';
import SearchIcon from '/media/icons/search-gray.svg';
import TagCloseIcon from '/media/icons/tag-close-gray.svg';

export interface ITreeSelectProps extends TreeSelectProps {
    searchPlaceholder?: string;
    isSortTreeData?: boolean;
    showSelectAll?: boolean;
}

const TreeSelect = ({ searchPlaceholder = 'Search', ...props }: ITreeSelectProps) => {
    // Props
    const {
        value,
        placeholder,
        multiple,
        treeCheckable,
        treeData,
        treeNodeFilterProp = 'label',
        treeNodeLabelProp = 'label',
        showCheckedStrategy = 'SHOW_PARENT',
        allowClear = true,
        popupMatchSelectWidth = 367,
        treeDefaultExpandAll = true,
        onChange,
        isSortTreeData = true,
        showSelectAll = true,
        ...otherProps
    } = props;

    const [isMaxTagCount, setIsMaxTagCount] = useState(1);

    // Keyword
    const [keyword, setKeyword] = useState('');
    const onChangeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
    };

    // Update current value when value is changed
    const [currentValue, setCurrentValue] = useState(value);
    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    // Check selected all tree nodes
    const checkIsSelectedAllTreeNodes = () => {
        let flag = true;

        if (currentValue?.length === treeData?.length) {
            currentValue?.forEach((value: any) => {
                if (treeData && treeData?.findIndex(data => data.value?.toString() === value.toString()) < 0) flag = false;
            });
        } else flag = false;

        return flag;
    };

    const isSelectedAllTreeNodes = multiple ? checkIsSelectedAllTreeNodes() : false;

    // Handle change current value
    const onChangeCurrentValue = (value: any, labelList: React.ReactNode[], extra: any) => {
        setCurrentValue(value);
        if (onChange) onChange(value, labelList, extra);
    };

    // Check all options
    useEffect(() => {
        if (!isSelectedAllTreeNodes) setIsMaxTagCount(1);
        else setIsMaxTagCount(0);
    }, [isSelectedAllTreeNodes]);

    // Handle click option all
    const onSelectAll = () => {
        if (isSelectedAllTreeNodes) {
            setCurrentValue(undefined);

            // If onChange props then call onChange
            if (onChange) onChange(undefined, [], {} as any);
        } else {
            // Set new value = all values of options
            const newValue = treeData?.map(data => data.value);
            setCurrentValue(newValue);

            // If onChange props then call onChange
            if (onChange) onChange(newValue, [], {} as any);
        }
    };

    const onCurrentDropdownVisibleChange = () => {
        setKeyword('');
    };

    // Get length of options
    const getOptionLength = () => {
        let result = 0;

        const getOptionLength = (options: any[]) => {
            result += options?.length || 0;

            options.forEach(option => {
                const optionChildren = option.children;

                if (optionChildren && Array.isArray(optionChildren)) getOptionLength(optionChildren);
            });
        };
        getOptionLength(treeData || []);

        return result;
    };
    const optionLength = getOptionLength();

    // Render dropdown
    // When option length or children length > 5 then show search input and All options (for multiple mode)
    const currentDropdownRender = (menu: any) => {
        return (
            <>
                {optionLength > 5 && (
                    <>
                        <Input
                            size="small"
                            className="select-search"
                            allowClear
                            addonBefore={<img src={SearchIcon} alt="icon" />}
                            placeholder={searchPlaceholder}
                            value={keyword}
                            onChange={onChangeKeyword}
                        />
                        {multiple && showSelectAll && (
                            <div className="select-option-all" onClick={onSelectAll}>
                                <Space>
                                    <Checkbox checked={isSelectedAllTreeNodes} />
                                    All
                                </Space>
                            </div>
                        )}
                    </>
                )}
                {menu}
            </>
        );
    };

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    // Render tag for multiple mode
    // Show tooltip for tag value
    const currentTagRender = (tag: any) => {
        const { label, closable, onClose } = tag;

        return !isSelectedAllTreeNodes || optionLength <= 5 ? (
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
        return !isSelectedAllTreeNodes || optionLength <= 5 ? (
            <Tooltip title={values.map((value: any) => value.label).join(', ')} trigger="hover" className="tag-count">
                +{values.length}
            </Tooltip>
        ) : (
            <div className="tag-count"></div>
        );
    };

    const updateTreeData = (data: any[]) => {
        const newData = isSortTreeData ? sortTreeData(data) : data;

        newData.forEach((data, index) => {
            if (data.children) newData[index].children = updateTreeData(data.children);
        });

        return newData;
    };

    // Sort data by title (a-z)
    const sortTreeData = (data: any[]) => {
        return data.sort((a, b) =>
            (a.label || '')
                .toString()
                .toLowerCase()
                .localeCompare((b.label || '').toString().toLowerCase())
        );
    };

    // Tree checkable
    const currentTreeCheckable = treeCheckable ?? multiple;

    // Tree data
    const [currentTreeData, setCurrentTreeData] = useState(updateTreeData(treeData || []));

    // Update current data when data was changed
    useEffect(() => {
        setCurrentTreeData(treeData || []);
    }, [treeData]);

    // Dynamic props
    const dynamicProps: TreeSelectProps = {
        multiple: multiple,
        /* Value */
        value: currentValue,
        allowClear: allowClear,
        onChange: onChangeCurrentValue,
        /* Options */
        treeData: currentTreeData,
        treeNodeFilterProp: treeNodeFilterProp,
        treeNodeLabelProp: treeNodeLabelProp,
        treeCheckable: currentTreeCheckable,
        treeDefaultExpandAll: treeDefaultExpandAll,
        showCheckedStrategy: showCheckedStrategy,
        filterTreeNode: true,
        popupMatchSelectWidth: popupMatchSelectWidth
    };

    // Blocked props
    const blockedProps: TreeSelectProps = {
        placeholder: '', // Use custom placeholder
        /* Search */
        searchValue: keyword,
        showSearch: false,
        /* Tag */
        maxTagCount: isMaxTagCount,
        tagRender: currentTagRender,
        maxTagPlaceholder: currentMaxTagPlaceholder,
        /* Dropdown */
        dropdownRender: currentDropdownRender,
        onDropdownVisibleChange: onCurrentDropdownVisibleChange,
        getPopupContainer: triggerNode => triggerNode.parentNode
    };

    return (
        <div className="select-container">
            {placeholder && !currentValue?.toString() && <div className="select-selection-placeholder">{placeholder}</div>}
            <AntTreeSelect {...dynamicProps} {...otherProps} {...blockedProps}></AntTreeSelect>
        </div>
    );
};

export default TreeSelect;
