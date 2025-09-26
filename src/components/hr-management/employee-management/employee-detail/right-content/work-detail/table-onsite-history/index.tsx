import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import TableHaveAdd from '@/components/common/table/table-add';
import { ITableHaveActionAddProps } from '@/types/common';
import { IOnsiteHistory } from '@/types/hr-management/employee-management';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import { ColumnsType } from 'antd/es/table';

const TableOnsiteHistory = (props: ITableHaveActionAddProps<IOnsiteHistory[]>) => {
    const { dataProps } = props;

    //Onsite history
    const columnsOnsiteHistory: ColumnsType<IOnsiteHistory> = [
        {
            dataIndex: 'countryName',
            key: 'countryName',
            title: 'Country',
            fixed: 'left',
            width: 120,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'cityName',
            key: 'cityName',
            title: 'City',
            width: 120,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: ORG_UNITS.Project,
            width: 150,
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'flightDeparture',
            key: 'flightDeparture',
            title: 'Flight Departure',
            width: 150,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'flightReturn',
            key: 'flightReturn',
            title: 'Flight Return',
            width: 150,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'expectedEndDate',
            key: 'expectedEndDate',
            title: 'Expected End',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'actualEndDate',
            key: 'actualEndDate',
            title: 'Actual End',
            width: 120,
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        }
    ];

    return (
        <TableHaveAdd
            title="Onsite History"
            dataSource={formatDataTable(dataProps)}
            columns={columnsOnsiteHistory}
            tableScroll={{ x: 'max-content', y: 400 }}
        />
    );
};

export default TableOnsiteHistory;
