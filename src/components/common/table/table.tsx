import { Select, Table } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { TableProps } from 'antd/es/table';
import { TableLocale, TablePaginationConfig } from 'antd/es/table/interface';
import { useEffect, useState } from 'react';
import EmptyBox from '../empty-box';

export interface IBaseTableProps<T> extends TableProps<T> {
    dataSource?: T[];
    rowClassName?: (record: T, index: number) => string;
    pageSizeMax?: boolean;
    totalItemsProp?: number;
    paginationTable?: {
        currentPage: number;
        pageSize: number;
        onChange: (currentPage: number, pageSize: number) => void;
    };
}

const BaseTable = <T extends AnyObject>(props: IBaseTableProps<T>) => {
    const {
        scroll: scrollProp,
        locale: localeProp,
        rowClassName: rowClassNameProp,
        pagination: paginationProp,
        paginationTable,
        dataSource,
        pageSizeMax,
        totalItemsProp,
        ...otherProps
    } = props;

    const totalItems = totalItemsProp ?? dataSource?.length ?? 0;

    // Locale
    const localeDefault: TableLocale = { emptyText: <EmptyBox loading={false} imageSize={120} minHeight={400} /> };
    const locale = localeProp ?? localeDefault;

    // Scroll
    const scrollDefault = { x: 'max-content', y: 466 };
    const scroll = scrollProp ?? scrollDefault;

    // Row class name
    const rowClassNameDefault = (_: T, index: number) => (index % 2 === 0 ? 'table-row-light' : 'table-row-dark');
    const rowClassName = rowClassNameProp ?? rowClassNameDefault;

    // Pagination

    const [pageSize, setPageSize] = useState(paginationTable?.pageSize ?? (pageSizeMax ? totalItems : 10));
    const [currentPage, setCurrentPage] = useState(paginationTable?.currentPage ?? 1);

    useEffect(() => {
        if (paginationTable?.pageSize !== undefined) setPageSize(paginationTable?.pageSize);
    }, [paginationTable?.pageSize]);

    useEffect(() => {
        if (paginationTable?.currentPage !== undefined) setCurrentPage(paginationTable?.currentPage);
    }, [paginationTable?.currentPage]);

    const pageSizeOptions = ['10', '50', '100'];
    const defaultPagination: TablePaginationConfig = {
        total: totalItems > 0 ? totalItems : 1,
        pageSize: pageSize,
        current: currentPage,
        onChange: (page: number, pageSize: number) => {
            setCurrentPage(page);
            setPageSize(pageSize);
            if (paginationTable?.onChange) {
                paginationTable.onChange(page, pageSize);
            }
        },
        showTotal: total => (
            <>
                <span className="total-text-display">Display</span>
                <Select
                    size="small"
                    className="total-select"
                    value={pageSize}
                    onChange={value => {
                        setPageSize(value);
                        if (paginationTable?.onChange) {
                            paginationTable.onChange(currentPage, value);
                        }
                    }}
                    options={pageSizeOptions.map(option => ({ label: option, value: option }))}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                />
                <span className="total-items">in {totalItems ? total : 0}</span>
            </>
        ),
        responsive: true,
        showSizeChanger: false
    };

    const pagination = paginationProp !== undefined ? paginationProp : defaultPagination;

    return (
        <Table
            {...otherProps}
            dataSource={dataSource}
            pagination={pagination}
            scroll={scroll}
            locale={locale}
            showSorterTooltip={false}
            rowClassName={rowClassName}
        />
    );
};

export default BaseTable;
