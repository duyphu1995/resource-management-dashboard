import { IDialogShowMore, IFilterData } from '@/types/filter';
import { Button, Checkbox, Modal, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import BaseTable from '../../table/table';
import './dialog-add-more-filter.scss';

interface IDialogShowMoreProps extends IDialogShowMore<IFilterData> {
    title: string;
    titleHeaderColumn: string;
}

const DialogShowMore = (props: IDialogShowMoreProps) => {
    const { open, onClose, data, onReset, onSave, title = '', titleHeaderColumn = '', ...otherProps } = props;
    const [checkedList, setCheckedList] = useState<string[]>([]);
    const [isIndeterminate, setIsIndeterminate] = useState(false);

    useEffect(() => {
        const initialCheckedList = data.filter(row => !row.alwaysShow && row.show).map(row => row.key);
        setCheckedList(initialCheckedList);
        setIsIndeterminate(initialCheckedList.length > 0 && initialCheckedList.length < moreFilterData.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const handleSave = () => {
        const updatedData = data.map(item => ({
            ...item,
            show: checkedList.includes(item.key)
        }));
        onSave(updatedData);
        resetPagination();
    };

    const handleCancel = () => {
        const initialCheckedList = data.filter(row => !row.alwaysShow && row.show).map(row => row.key);
        setCheckedList(initialCheckedList);
        setIsIndeterminate(initialCheckedList.length > 0);
        onClose();
        resetPagination();
    };

    const handleCheckboxChange = (key: string, checked: boolean) => {
        const updatedCheckedList = checked ? checkedList.filter(item => item !== key) : [...checkedList, key];
        setCheckedList(updatedCheckedList);
        setIsIndeterminate(updatedCheckedList.length > 0 && updatedCheckedList.length < moreFilterData.length);
    };

    const handleCheckAll = () => {
        const newCheckedList = isCheckAll ? [] : moreFilterData.map(item => item.key);
        setCheckedList(newCheckedList);
        setIsIndeterminate(!isCheckAll);
    };

    const resetPagination = () => {
        setPaginationCustom({ ...paginationCustom, current: 1, pageSize: 10 });
        setPageSize(10);
    };

    const moreFilterData = data.filter(item => !item.alwaysShow);
    const isCheckAll = moreFilterData.length === checkedList.length;

    const columns: ColumnsType<IFilterData> = [
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
    ];

    const [pageSize, setPageSize] = useState<number>(10);
    const pageSizeOptions: string[] = ['10', '50', '100'];
    const [paginationCustom, setPaginationCustom] = useState({
        total: moreFilterData.length || 1,
        pageSize,
        responsive: true,
        showSizeChanger: false,
        current: 1,
        onChange: (page: number) => setPaginationCustom(prev => ({ ...prev, current: page }))
    });

    const showTotal = (total: number) => (
        <>
            <span className="total-text-display">Display</span>
            <Select
                size="small"
                className="total-select"
                value={pageSize.toString()}
                onChange={(value: string) => {
                    const newPageSize = parseInt(value, 10);
                    setPageSize(newPageSize);
                    setPaginationCustom(prev => ({ ...prev, pageSize: newPageSize }));
                }}
                options={pageSizeOptions.map(option => ({ label: option, value: option }))}
                getPopupContainer={triggerNode => triggerNode.parentNode}
            />
            <span className="total-items">in {moreFilterData.length > 0 ? total : 0}</span>
        </>
    );

    const handleResetModal = () => {
        onReset();
        resetPagination();
    };

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
                pagination={{ ...paginationCustom, showTotal: showTotal }}
            />
        </Modal>
    );
};

export default DialogShowMore;
