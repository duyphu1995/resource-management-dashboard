import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';

const TablePAHistory = (props: ITableHaveActionAddProps<any[]>) => {
    const { dataProps } = props;

    //PA history
    const columnsPAHistory: ColumnsType<any> = [
        {
            dataIndex: 'fromDate',
            key: 'fromDate',
            title: 'From',
            width: 118,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'toDate',
            key: 'toDate',
            title: 'To',
            width: 118,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'score',
            key: 'score',
            title: 'PA Score',
            width: 83,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'project',
            key: 'project',
            title: ORG_UNITS.Project,
            width: 88,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'manager',
            key: 'manager',
            title: 'Manager',
            width: 142,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'position',
            key: 'position',
            title: 'Position',
            width: 104,
            render: item => renderWithFallback(item)
        }
    ];

    return <TableHaveAdd title="PA History" dataSource={formatDataTable(dataProps)} columns={columnsPAHistory} />;
};

export default TablePAHistory;
