import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, ITabEmployeeSummaryProps, IUnitSummary } from '@/types/reports/employee-summary';
import { escapeSelector, formatDataTable, handleClickViewListOfNewWindow, sumTotalEmployees } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RenderRow from '../../util/render-row-in-table';
('../../until/render-row-in-table');

const DGSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab, dataTmaSummary = [] } = props;

    const moduleName = props.moduleName + 'BU';
    const moduleNameDetails = props.moduleName + 'BUDetails';

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { section } = usePermissions('EmployeeDetails', 'EmployeeManagement');
    const { section: sectionClick } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const [dataList, setDataList] = useState<IUnitSummary[]>([]);

    const isContractor = currentTab === 'ContractorSummary';
    const titleTotal = isContractor ? 'Contractor' : 'Employee';

    let pathDetailEmployee = '';

    if (section) {
        pathDetailEmployee = pathnames.hrManagement.employeeManagement.detail.path;
    } else {
        pathDetailEmployee = pathnames.groupManagement.detail.path;
    }

    const dgSummaryColumns: ColumnType<IUnitSummary>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: ORG_UNITS.DG,
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: (item, record) => (
                <Link to={pathnames.groupManagement.main.path + `/${record.unitId}`} target="_blank" className="underline">
                    {renderWithFallback(item)}
                </Link>
            )
        },
        {
            dataIndex: 'managerName',
            key: 'managerName',
            title: 'Manager',
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: (item, record) => (
                <Link to={pathDetailEmployee + `/${record.managerId}`} target="_blank" className="underline">
                    {renderWithFallback(item)}
                </Link>
            )
        },
        {
            dataIndex: 'totalEmployee',
            key: 'totalEmployee',
            title: `Total ${ORG_UNITS.DG} ${isContractor ? 'Contractors' : 'Employee'}`,
            width: 170,
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: (item, record) => {
                return sectionClick ? (
                    <a
                        className="underline"
                        onClick={() =>
                            handleClickViewListOfNewWindow(
                                pathnames.reports.employeeSummaryReport.reportListFilter.path +
                                    '/' +
                                    record.unitId +
                                    `?unitName=${encodeURIComponent(record.unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
                            )
                        }
                    >
                        {renderWithFallback(item)}
                    </a>
                ) : (
                    renderWithFallback(item)
                );
            }
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'dc',
            title: 'DC/Group',
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => (
                <RenderRow
                    rows={record}
                    type="unitName"
                    onRowChildren="link"
                    generateUrl={doc => `${pathnames.groupManagement.main.path}/${doc.unitId}`}
                />
            )
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'totalEmployeeChild',
            title: `Total ${ORG_UNITS.DC} ${isContractor ? 'Contractors' : 'Employee'}`,
            className: 'table-padding-0',
            width: 170,
            render: (record: IUnitSummary[]) => (
                <RenderRow
                    rows={record}
                    type="totalEmployee"
                    onRowChildren={sectionClick ? 'a' : 'div'}
                    generateUrl={doc =>
                        `${pathnames.reports.employeeSummaryReport.reportListFilter.path}/${doc.unitId}?unitName=${doc.unitName}&tab=${tab}&moduleName=${moduleNameDetails}`
                    }
                />
            )
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'managerNameChild',
            title: 'Director',
            className: 'table-padding-0',
            render: (record: IUnitSummary[]) => (
                <RenderRow rows={record} type="managerName" onRowChildren="link" generateUrl={doc => `${pathDetailEmployee}/${doc.managerId}`} />
            )
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                // DG Summary in DB is id 1
                const res = await employeeSummaryService.getUnitSummaryList({ ...params, customOrgChartReportStructureId: 1 }, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get dg list');
            } finally {
                turnOffLoading();
            }
        };
        if (tab === currentTab) {
            if (tab.startsWith('CompanySummary')) {
                const companyId = tab.split('-')[1];
                fetchDataList({ companyId: parseInt(companyId) });
                return;
            }
            fetchDataList({ tabType: tab });
        }
    }, [tab, currentTab, moduleName, showNotification, turnOnLoading, turnOffLoading]);

    return (
        // Hardcode data according to TMA Summary table
        <div id={`${escapeSelector(dataTmaSummary[1]?.orgChartReportTypeName)}_${currentTab}`} className="title-header-table">
            <h3 className="title">
                {ORG_UNITS.DG} Summary (Total {titleTotal}: {sumTotalEmployees(dataList)})
            </h3>
            <BaseTable
                columns={dgSummaryColumns}
                dataSource={formatDataTable(dataList)}
                loading={isLoading}
                rootClassName="table-dg-summary-report"
                bordered
                pageSizeMax
                pagination={false}
                scroll={{ x: 1200, y: 900 }}
                className="table-virtual"
                virtual
            />
        </div>
    );
};

export default DGSummary;
