import { useEffect, useState, useCallback, useMemo } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { Button, Checkbox, Modal, Select } from 'antd';
import BaseTable from '../../table/table';
import { IMoreReportFilterModalProps } from '@/types/filter';
import './index.scss';

const MoreFilterModal = (props: IMoreReportFilterModalProps) => {
    const { open, onClose, data, onReset, onSave, title = 'More Filter', titleHeaderColumn = 'Filter', ...otherProps } = props;

    const [checkedList, setCheckedList] = useState<string[]>([]);
    const [isIndeterminate, setIsIndeterminate] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [paginationCustom, setPaginationCustom] = useState({
        total: 1,
        pageSize,
        responsive: true,
        showSizeChanger: false,
        current: 1,
        onChange: (page: number) => setPaginationCustom(prev => ({ ...prev, current: page }))
    });

    const moreFilterData = useMemo(() => data.filter(item => !item.alwaysShow), [data]);
    const isCheckAll = useMemo(() => moreFilterData.length === checkedList.length, [moreFilterData, checkedList]);

    const handleSetChecked = useCallback(
        (updatedCheckedList: string[]) => {
            const indeterminate = updatedCheckedList.length > 0 && updatedCheckedList.length < moreFilterData.length;
            setCheckedList(updatedCheckedList);
            setIsIndeterminate(indeterminate);
        },
        [moreFilterData]
    );

    useEffect(() => {
        const initialCheckedList = moreFilterData.filter(row => row.show).map(row => row.key);
        handleSetChecked(initialCheckedList);
    }, [moreFilterData, handleSetChecked]);

    const resetPagination = useCallback(() => {
        setPaginationCustom(prev => ({ ...prev, current: 1, pageSize: 10 }));
        setPageSize(10);
    }, []);

    const handleSave = useCallback(() => {
        const updatedData = data.map(item => ({
            ...item,
            show: checkedList.includes(item.key)
        }));
        onSave(updatedData);
        resetPagination();
    }, [data, checkedList, onSave, resetPagination]);

    const handleCancel = useCallback(
        (e: React.SyntheticEvent) => {
            const initialCheckedList = moreFilterData.filter(row => row.show).map(row => row.key);
            handleSetChecked(initialCheckedList);

            if (onClose) onClose(e);
            resetPagination();
        },
        [moreFilterData, onClose, resetPagination, handleSetChecked]
    );

    const handleCheckboxChange = useCallback(
        (key: string, checked: boolean) => {
            const updatedCheckedList = checked ? checkedList.filter(item => item !== key) : [...checkedList, key];
            handleSetChecked(updatedCheckedList);
        },
        [checkedList, handleSetChecked]
    );

    const handleCheckAll = useCallback(() => {
        const newCheckedList = isCheckAll ? [] : moreFilterData.map(item => item.key);
        handleSetChecked(newCheckedList);
    }, [isCheckAll, moreFilterData, handleSetChecked]);

    const handlePageSizeChange = useCallback((value: string) => {
        const newPageSize = parseInt(value, 10);
        setPageSize(newPageSize);
        setPaginationCustom(prev => ({ ...prev, pageSize: newPageSize }));
    }, []);

    const showTotal = useCallback(
        (total: number) => (
            <>
                <span className="total-text-display">Display</span>
                <Select
                    size="small"
                    className="total-select"
                    value={pageSize.toString()}
                    onChange={handlePageSizeChange}
                    options={['10', '50', '100'].map(option => ({ label: option, value: option }))}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                />
                <span className="total-items">in {moreFilterData.length > 0 ? total : 0}</span>
            </>
        ),
        [pageSize, handlePageSizeChange, moreFilterData]
    );

    const handleResetModal = useCallback(() => {
        onReset();
        resetPagination();
    }, [onReset, resetPagination]);

    const columns: ColumnsType = useMemo(
        () => [
            {
                title: (
                    <Checkbox checked={isCheckAll} indeterminate={isIndeterminate} onChange={handleCheckAll}>
                        {titleHeaderColumn}
                    </Checkbox>
                ),
                key: 'showHide',
                render: record => {
                    const { key, alwaysShow, label } = record;
                    const checked = checkedList.includes(key) || alwaysShow;
                    return (
                        <Checkbox disabled={alwaysShow} checked={checked} onChange={() => handleCheckboxChange(key, checked)}>
                            {label}
                        </Checkbox>
                    );
                }
            }
        ],
        [checkedList, isCheckAll, isIndeterminate, handleCheckAll, handleCheckboxChange, titleHeaderColumn]
    );

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            className="show-column-dialog"
            title={title}
            width={460}
            centered
            closable={false}
            footer={
                <div className="button-footer">
                    <Button onClick={handleResetModal}>Reset</Button>
                    <div className="dialog-btn-ft-right">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" onClick={handleSave}>
                            Save
                        </Button>
                    </div>
                </div>
            }
            {...otherProps}
        >
            <BaseTable
                dataSource={moreFilterData}
                columns={columns}
                scroll={{ x: 'max-content', y: 410 }}
                rootClassName="min-h-410 filter-common"
                pagination={{ ...paginationCustom, showTotal }}
            />
        </Modal>
    );
};

export default MoreFilterModal;
