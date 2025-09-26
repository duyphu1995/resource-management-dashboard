import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';

const TableWorkingStatus = (props: ITableHaveActionAddProps<any[]>) => {
    const { dataProps } = props;

    //Working status
    const columnsWorkingStatus: ColumnsType<any> = [
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Working Status',
            fixed: 'left',
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 120,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'effort',
            key: 'effort',
            title: 'Effort',
            width: 80,
            render: item => renderWithFallback(item + '%')
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'actualEndDate',
            key: 'actualEndDate',
            title: 'Actual End Date',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    return (
        <TableHaveAdd
            title="Working Status"
            dataSource={formatDataTable(dataProps)}
            columns={columnsWorkingStatus}
            tableScroll={{ x: 'max-content', y: 400 }}
        />
    );
};

export default TableWorkingStatus;
