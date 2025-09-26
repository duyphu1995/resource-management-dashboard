import { renderBooleanStatus, renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { IContract } from '@/types/hr-management/contract-management';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ColumnsType } from 'antd/es/table';

const TableContract = (props: ITableHaveActionAddProps<IContract[]>) => {
    const { dataProps } = props;

    //Contract
    const columnsContract: ColumnsType<IContract> = [
        {
            dataIndex: 'contractTypeName',
            key: 'contractTypeName',
            title: 'Contract Type',
            fixed: 'left',
            width: 161,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isNonTechnical',
            key: 'isNonTechnical',
            title: 'Non - Technical',
            width: 142,
            render: item => renderBooleanStatus(item, 'isNonTechnical')
        },
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'Start Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'End Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'signOrder',
            key: 'signOrder',
            title: 'Sign Order',
            width: 104,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'isRenewalContract',
            key: 'isRenewalContract',
            title: 'Renew Approval',
            width: 150,
            render: item => renderWithFallback(item ? 'Approved' : 'Pending')
        },
        {
            dataIndex: 'notes',
            key: 'notes',
            title: 'Note',
            width: 120,
            render: item => renderWithFallback(item, true, 20)
        }
    ];

    return (
        <TableHaveAdd title="Contract" dataSource={formatDataTable(dataProps)} columns={columnsContract} tableScroll={{ x: 'max-content', y: 400 }} />
    );
};

export default TableContract;
