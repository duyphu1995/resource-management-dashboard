import { IFilterData, IFilterProps } from '@/types/filter';
import { Button, Col, Form, Input, Row, Segmented } from 'antd';
import { ChangeEvent, useState } from 'react';
import DialogImport from '../../dialog/dialog-import/dialog-import';
import RequiredMark from '../../form/required-mark';
import Loading from '../../loading';
import DialogShowMore from './dialog-add-more-filter';
import './index.scss';
import SearchIcon from '/media/icons/search-gray.svg';

const plusIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.99984 2.66663C8.36803 2.66663 8.6665 2.9651 8.6665 3.33329V7.33329H12.6665C13.0347 7.33329 13.3332 7.63177 13.3332 7.99996C13.3332 8.36815 13.0347 8.66663 12.6665 8.66663H8.6665V12.6666C8.6665 13.0348 8.36803 13.3333 7.99984 13.3333C7.63165 13.3333 7.33317 13.0348 7.33317 12.6666V8.66663H3.33317C2.96498 8.66663 2.6665 8.36815 2.6665 7.99996C2.6665 7.63177 2.96498 7.33329 3.33317 7.33329H7.33317V3.33329C7.33317 2.9651 7.63165 2.66663 7.99984 2.66663Z"
            fill="currentColor"
        />
    </svg>
);

const showFilterIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="9" viewBox="0 0 13 9" fill="none">
        <path d="M6.5 0L13 9H0L6.5 0" fill="#DFDFDF" />
        <path d="M6.60017 1.80078L11.8002 9.00078H1.40017L6.60017 1.80078Z" fill="#F8F8F8" />
    </svg>
);

const Filter = (props: IFilterProps) => {
    const {
        form,
        data,
        loading,
        count,
        moreButtons,
        showContent,
        setShowContent,
        onChangeValue,
        hiddenFilter,
        hiddenSearchInput,
        searchInput,

        // More filter
        moreFilterButton,
        moreFilterModal,

        // Import, export
        importModal,

        // Bottom buttons
        applyButton,
        resetButton,
        quickFilterAddButton,

        // Segmented and more buttons
        segmented,

        // Table showed columns
        tableShowedColumnsButton,
        tableShowedColumnsModal
    } = props;

    // Count JSX
    const countJSX = count > 0 && <span>&nbsp;({count})</span>;

    const filterItems = data.map((filterItem: IFilterData) => {
        const { colSpan = 6, key } = filterItem;
        const usedProps: any = { ...filterItem, name: key, children: { ...filterItem.control } };
        usedProps.children.props = { ...usedProps.children.props, onChange: onChangeValue };

        // Delete not used props
        const deletedKey = ['key', 'colSpan', 'forColumns', 'alwaysShow', 'show', 'control'];
        deletedKey.forEach(key => delete usedProps[key]);

        return (
            (filterItem.show || filterItem.alwaysShow) && (
                <Col span={colSpan} key={key}>
                    <Form.Item {...usedProps} name={key}></Form.Item>
                </Col>
            )
        );
    });

    const filterItemsJSX = (
        <Row className="filter-items" gutter={[20, 16]}>
            {filterItems}
            {moreFilterButton && (
                <Form.Item>
                    <Button type="link" size="small" className="add-more-filter" {...moreFilterButton}>
                        {plusIcon}More Filter
                    </Button>
                </Form.Item>
            )}
        </Row>
    );

    // Search input
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

    // Handle change keyword (search input)
    const onChangeKeyword = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (typingTimeout) clearTimeout(typingTimeout);

        const newTimeout = setTimeout(() => {
            searchInput?.onChange(value);
        }, 1000);

        setTypingTimeout(newTimeout);
    };

    // Render more buttons
    const renderMoreButtons = () => {
        return moreButtons?.map((button, id) => <Button key={id} {...button} />);
    };

    return (
        <div className="filter-container">
            {/* Filter Header */}
            <div className="filter-header">
                {/* Filter Start Content*/}
                <div className="filter-start">
                    {!hiddenSearchInput && (
                        <Input
                            className="search-input"
                            addonBefore={<img src={SearchIcon} alt="icon" />}
                            placeholder={searchInput?.placeholder}
                            allowClear
                            onChange={onChangeKeyword}
                            defaultValue={searchInput?.value}
                        />
                    )}
                    {!hiddenFilter && (
                        <Button className="filter-show-button" onClick={() => setShowContent(!showContent)}>
                            <span>Filter</span> {countJSX}
                            {showFilterIcon}
                        </Button>
                    )}
                </div>

                {/* Filter End Content */}
                <div className="filter-end">
                    {/* Filter Segmented */}
                    {segmented && segmented.options && (
                        <div>
                            <Segmented
                                className="filter-segmented"
                                options={segmented.options.map(option => ({ ...option, value: JSON.stringify(option.value) }))}
                                value={JSON.stringify(segmented.value)}
                                onChange={segmented.onChange}
                            />
                        </div>
                    )}

                    {/* Show More Column Button */}
                    {tableShowedColumnsButton && <Button {...tableShowedColumnsButton}>Show/hide Column</Button>}

                    {/* Import, export and more buttons */}
                    {renderMoreButtons()}
                </div>
            </div>

            {/* Filter Content */}
            <Form
                form={form}
                layout="vertical"
                requiredMark={RequiredMark}
                onFinish={applyButton.onClick}
                className={`filter-content${showContent ? ' is-show' : ''}`}
            >
                {loading ? <Loading /> : filterItemsJSX}

                {/* Filter Actions */}
                <div className="filter-content-actions">
                    <Button size="small" type="primary" htmlType="submit" hidden={applyButton.hidden}>
                        Apply
                    </Button>
                    <Button size="small" {...resetButton}>
                        Reset
                    </Button>
                    {(!applyButton.hidden || !resetButton.hidden) && <div className="filter-content-actions-hr" />}
                    <Button size="small" {...quickFilterAddButton}>
                        Add Quick Filter
                    </Button>
                </div>
            </Form>

            {/* MODAL */}
            {importModal && <DialogImport {...importModal} />}
            {/* Dialog show column select */}
            {tableShowedColumnsModal && <DialogShowMore title="Show/Hide Column" titleHeaderColumn="Column" {...tableShowedColumnsModal} />}
            {moreFilterModal && <DialogShowMore title="More Filter" titleHeaderColumn="Filter" {...moreFilterModal} />}
        </div>
    );
};

export default Filter;
