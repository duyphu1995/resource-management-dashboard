import BaseTable from '@/components/common/table/table';
import { Button } from 'antd';
import './index.scss';
import { ColumnsType } from 'antd/es/table';

interface ITableEducationProps<T> {
    title: string;
    dataSource: T[];
    rowKey?: (record: T) => string;
    columns: ColumnsType<T>;
    tableScroll?: any;
    handleAdd?: (() => void) | undefined;
    disabled?: boolean;
    bordered?: boolean;
    loading?: boolean;
}

const TableHaveAdd = <T extends object>(props: ITableEducationProps<T>) => {
    const { title, dataSource, rowKey, columns, tableScroll, handleAdd, disabled, bordered = false, loading = false } = props;

    return (
        <div className="table-container">
            <div className="content-header">
                <h3 className="title">{title}</h3>
                {handleAdd && (
                    <Button className="btn" type="text" onClick={handleAdd} disabled={disabled}>
                        <img src="/media/icons/plus.svg" alt="plus.svg" />
                        <span>Add</span>
                    </Button>
                )}
            </div>
            <div className="content-body">
                <BaseTable
                    dataSource={dataSource}
                    rowKey={rowKey}
                    columns={columns}
                    scroll={tableScroll}
                    className={bordered ? 'table-header-bordered' : ''}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default TableHaveAdd;
