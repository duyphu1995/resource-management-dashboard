import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import { IYearOfExperienceSummary } from '@/types/reports/resource-experience';
import { formatDataTable, formatNumberWithDecimalPlaces } from '@/utils/common';
import { TableColumnsType, Tooltip } from 'antd';
import './index.scss';

const TableExperienceSummary = ({ isLoading, dataTable }: { isLoading: boolean; dataTable: IYearOfExperienceSummary[] | undefined }) => {
    const ranges = [
        { value: '<1', title: '<12 months' },
        { value: '1', title: '>=12 months and <24 months' },
        { value: '2', title: '>=24 months and <36 months' },
        { value: '3', title: '>=36 months and <48 months' },
        { value: '4', title: '>=48 months and <60 months' },
        { value: '5', title: '>=60 months and <72 months' },
        { value: '6', title: '>=72 months and <84 months' },
        { value: '7', title: '>=84 months and <96 months' },
        { value: '8', title: '>=96 months and <108 months' },
        { value: '9', title: '>=108 months and <120 months' },
        { value: '10', title: '>=120 months and <132 months' },
        { value: '>10', title: '>=132 months' }
    ];

    const renderWithTooltip = (value: string, title: string) => <Tooltip title={title}>{value}</Tooltip>;

    const columns: TableColumnsType<IYearOfExperienceSummary> = [
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC / Group',
            width: 180,
            render: item => renderWithFallback(item)
        },
        {
            title: 'Year of Experience',
            children: [
                ...ranges.map((range, index) => ({
                    dataIndex: `range${index}`,
                    title: renderWithTooltip(range.value, range.title)
                }))
            ].map(item => ({
                ...item,
                width: 50,
                align: 'center',
                render: item => renderWithFallback(formatNumberWithDecimalPlaces(item))
            }))
        }
    ];

    const rowClassName = (record: IYearOfExperienceSummary, index: number): string => {
        const isDGClass = record.isDG ? 'table-row-dg' : '';
        const isTotalClass = record.isCountTotal ? 'table-row-total' : '';
        const rowClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        const rowDCTotalClass = record.dcName === 'DC Total' ? 'table-row-dc-total' : '';

        return `${rowDCTotalClass} ${isDGClass} ${isTotalClass} ${rowClass}`.trim();
    };

    return (
        <BaseTable
            className="table-experience-summary"
            columns={columns}
            dataSource={formatDataTable(dataTable)}
            pagination={false}
            bordered
            loading={isLoading}
            rowClassName={rowClassName}
        />
    );
};

export default TableExperienceSummary;
