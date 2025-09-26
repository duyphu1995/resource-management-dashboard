import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { IPositionSummary, ISummaryProps } from '@/types/reports/employee-summary';
import { formatDataTable, handleClickViewListOfNewWindow } from '@/utils/common';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType } from 'antd/es/table';

interface ITabPositionSummaryListProps extends ISummaryProps<IPositionSummary> {
    tab: string;
    moduleName: string;
    currentTab?: string;
}

const PositionSummaryList = (props: ITabPositionSummaryListProps) => {
    const { dataProps, isLoading, tab, currentTab, moduleName } = props;

    const moduleNameDetails = moduleName + 'PositionDetails';

    const { section } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const isContractor = currentTab === 'ContractorSummary';

    const splitDataIntoColumns = (data: any[], chunkSize: number) => {
        const result = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            result.push(data.slice(i, i + chunkSize));
        }
        return result;
    };

    const formatDataForTable = (data: any[]) => {
        const chunkSize = 15;
        const columnsData = splitDataIntoColumns(data, chunkSize);
        const formattedData = [];

        for (let i = 0; i < chunkSize; i++) {
            const row: { [key: string]: string | number } = {};
            columnsData.forEach((col, index) => {
                row[`position_${index}`] = col[i]?.positionName || '';
                row[`employee_${index}`] = col[i]?.totalEmployee || '';
                row[`positionId_${index}`] = col[i]?.positionId || '';
            });
            formattedData.push(row);
        }

        return formattedData;
    };

    const generateColumns = (data: any[]): ColumnType<{ [key: string]: string | number }>[] => {
        const numOfColumns = Math.ceil(data.length / 15);
        const columns: ColumnType<{ [key: string]: string | number }>[] = [];

        for (let i = 0; i < numOfColumns; i++) {
            columns.push(
                {
                    dataIndex: `position_${i}`,
                    key: `position_${i}`,
                    title: `Position`,
                    align: 'center',
                    render: item => renderWithFallback(item)
                },
                {
                    dataIndex: `employee_${i}`,
                    key: `employee_${i}`,
                    title: isContractor ? 'Number of Contractor' : '# Of Employee',
                    className: 'align-center',
                    render: (item, record) => {
                        const positionSummary: IPositionSummary = {
                            positionName: record[`position_${i}`] as string,
                            totalEmployee: record[`employee_${i}`] as number,
                            positionId: record[`positionId_${i}`] as string
                        };

                        return item && section ? (
                            <a
                                className="full-name"
                                onClick={() => {
                                    handleClickViewListOfNewWindow(
                                        pathnames.reports.employeeSummaryReport.positionDetails.path +
                                            '/' +
                                            positionSummary.positionId +
                                            `?positionName=${positionSummary.positionName}&tab=${tab}&moduleName=${moduleNameDetails}`
                                    );
                                }}
                            >
                                {renderWithFallback(item || 0)}
                            </a>
                        ) : (
                            renderWithFallback(item || 0)
                        );
                    }
                }
            );
        }

        return columns;
    };

    const genderColumns = generateColumns(dataProps);
    const formattedData = formatDataForTable(dataProps);

    return (
        <BaseTable
            columns={genderColumns}
            dataSource={formatDataTable(formattedData)}
            loading={isLoading}
            scroll={{ x: 'max-content' }}
            pagination={false}
            bordered
        />
    );
};

export default PositionSummaryList;
