import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import { IGraduatedSummary, ISummaryProps } from '@/types/reports/employee-summary';
import { formatDataTable, handleClickViewListOfNewWindow } from '@/utils/common';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType, TablePaginationConfig } from 'antd/es/table';

interface ITabGraduatedSummaryProps extends ISummaryProps<IGraduatedSummary> {
    moduleName?: string;
    disabled?: boolean;
    bordered?: boolean;
    pagination?: false | TablePaginationConfig;
    scroll?: any;
    rootClassName?: string;
    tab?: string;
}

const GraduatedSummaryList = (props: ITabGraduatedSummaryProps) => {
    const { dataProps, isLoading, disabled, tab, moduleName, ...otherProps } = props;

    const moduleNameDetails = moduleName + 'GraduatedDetails';

    const { section } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const dgNames = Array.from(new Set(dataProps.flatMap(university => university.graduatedByDGDtos.map(dg => dg.unitName))));

    const handleHeaderClick = (dgName: string) => {
        const record = dataProps.find(item => item.universityName === 'Total Employees');
        const clickedItem = record?.graduatedByDGDtos.find(item => item.unitName === dgName);
        const dgId = clickedItem?.unitId;

        if (dgId === 241 || dgId === 999999) {
            // If dgId is 241 or 999999, do nothing or prevent default action
            return;
        } else if (dgId) {
            const unitId = record?.graduatedByDGDtos.filter(item => item.unitId === dgId);
            handleClickViewListOfNewWindow(
                pathnames.reports.employeeSummaryReport.graduatedDetails.path +
                    '/' +
                    dgId +
                    `?unitName=${encodeURIComponent(unitId![0].unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
            );
        }
    };

    const graduatedColumns: ColumnType<IGraduatedSummary>[] = [
        {
            title: 'Institute Name',
            dataIndex: 'universityName',
            key: 'universityName',
            fixed: 'left',
            width: 600,
            render: (value: string, record: IGraduatedSummary) => {
                const total = record.universityName.includes('Total');
                return <span className={total ? 'font-weight-600 c-2a9ad6' : ''}>{value}</span>;
            }
        },
        ...dgNames.map(dgName => ({
            title: dgName,
            dataIndex: dgName,
            key: dgName,
            align: 'center' as const,
            width: dgName.length < 10 ? 120 : dgName.length * 12,
            render: (_: number, record: IGraduatedSummary) => {
                const clickedItem = record.graduatedByDGDtos.find(item => item.unitName === dgName);
                const itemNumber = clickedItem?.number ?? 0;
                const dgId = clickedItem?.unitId;

                const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
                    if (dgId === 241 || dgId === 999999) {
                        event.preventDefault();
                    } else {
                        const unitId = record.graduatedByDGDtos.filter(item => item.unitId === dgId);
                        handleClickViewListOfNewWindow(
                            pathnames.reports.employeeSummaryReport.graduatedDetails.path +
                                '/' +
                                dgId +
                                `?unitName=${encodeURIComponent(unitId[0].unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
                        );
                    }
                };

                if (record.universityName.includes('Total')) {
                    // id 241 is BOD and id 999999 is Total Graduated
                    return dgId === 241 || dgId === 999999 || disabled || itemNumber === 0 || !section ? (
                        <div className="font-weight-600 c-2a9ad6">{renderWithFallback(itemNumber)}</div>
                    ) : (
                        <a className="full-name" onClick={handleClick}>
                            {renderWithFallback(itemNumber)}
                        </a>
                    );
                }

                return renderWithFallback(itemNumber);
            },
            onHeaderCell: () => ({
                className: 'cursor-pointer',
                onClick: () => {
                    handleHeaderClick(dgName);
                }
            })
        }))
    ];

    return (
        <BaseTable
            columns={graduatedColumns}
            dataSource={formatDataTable(dataProps)}
            loading={isLoading}
            pageSizeMax
            pagination={false}
            scroll={{ x: 1200, y: 517 }}
            className="table-virtual"
            virtual
            {...otherProps}
        />
    );
};

export default GraduatedSummaryList;
