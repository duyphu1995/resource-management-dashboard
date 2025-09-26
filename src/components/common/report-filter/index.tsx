import { IReportFilterProps } from '@/types/filter';
import { getRandomKey, isEmpty } from '@/utils/common';
import { Button, Col, Form, Row } from 'antd';
import { useEffect, useState } from 'react';
import RequiredMark from '../form/required-mark';
import { getFilterValue } from '../list-management/filter/use-filter';
import Loading from '../loading';
import MoreFilterModal from './more-filter-modal';
import plusIcon from '/media/icons/plus.svg';
import './index.scss';

const showFilterIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="9" viewBox="0 0 13 9" fill="none">
        <path d="M6.5 0L13 9H0L6.5 0" fill="#DFDFDF" />
        <path d="M6.60017 1.80078L11.8002 9.00078H1.40017L6.60017 1.80078Z" fill="#F8F8F8" />
    </svg>
);

const ReportFilter = (props: IReportFilterProps) => {
    const {
        pageTitle,
        moreButtons = [],
        filterForm: filterFormProp,
        data = [],
        loading = true,
        rootClassName,
        hiddenButtonFilter = false,
        moreFilterButton,
        moreFilterModal,
        onFilter,
        onResetFilter,
        resetFields,
        showFilter = false
    } = props;

    const [showContent, setShowContent] = useState(false);
    const [isDisableFilter, setIsDisableFilter] = useState(true);

    const [filterFormState] = Form.useForm();
    const filterForm = filterFormProp ?? filterFormState;

    const onFinish = () => {
        const newFilterValue = getFilterValue(filterForm, data);
        onFilter?.(newFilterValue);
    };

    const handleResetFilter = () => {
        onResetFilter?.();
        filterForm.resetFields(resetFields);
        setIsDisableFilter(true);
    };

    const moreButtonsJSX = moreButtons.length ? moreButtons.map((button, index) => <Button {...button} key={getRandomKey(index)} />) : null;

    const filterItems = data.map((filterItem: any) => {
        const { colSpan = 6, key, valuePropName = undefined } = filterItem;
        const usedProps: any = { ...filterItem, name: key, children: { ...filterItem.control } };

        // Delete not used props
        const deletedKey = ['key', 'colSpan', 'forColumns', 'alwaysShow', 'show', 'control'];
        deletedKey.forEach(key => delete usedProps[key]);

        return (
            (filterItem.show || filterItem.alwaysShow) && (
                <Col span={colSpan} key={key}>
                    <Form.Item htmlFor="" {...usedProps} name={key} valuePropName={valuePropName} />
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
                        {<img src={plusIcon} alt="plus-icon" />} More Filter
                    </Button>
                </Form.Item>
            )}
        </Row>
    );

    const onValuesChange = (_: any, allValues: any) => {
        const allFieldsAreEmpty = Object.values(allValues).every(value => isEmpty(value));
        setIsDisableFilter(allFieldsAreEmpty);
        if (allFieldsAreEmpty) {
            handleResetFilter();
        }
    };

    useEffect(() => {
        setShowContent(showFilter);
    }, [showFilter]);

    return (
        <div className={`filter-container ${rootClassName}`}>
            <div className="filter-header">
                <div className="filter-start">
                    <div className="page-title">{pageTitle}</div>
                </div>
                <div className="filter-end">
                    {!hiddenButtonFilter && (
                        <Button className="filter-show-button" onClick={() => setShowContent(!showContent)}>
                            <span>Filter</span>
                            {showFilterIcon}
                        </Button>
                    )}
                    {moreButtonsJSX}
                </div>
            </div>

            <Form
                form={filterForm}
                layout="vertical"
                requiredMark={RequiredMark}
                onFinish={onFinish}
                className={`filter-content${showContent ? ' is-show' : ''}`}
                onValuesChange={onValuesChange}
            >
                {loading ? <Loading /> : filterItemsJSX}
                <div className="filter-content-actions">
                    <Button size="small" type="primary" htmlType="submit" disabled={isDisableFilter}>
                        Apply
                    </Button>
                    <Button size="small" onClick={handleResetFilter}>
                        Reset
                    </Button>
                </div>
            </Form>
            {moreFilterModal && <MoreFilterModal {...moreFilterModal} />}
        </div>
    );
};

export default ReportFilter;
