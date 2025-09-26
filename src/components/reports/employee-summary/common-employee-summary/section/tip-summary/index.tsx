import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, ITabEmployeeSummaryProps, IUnitSummary } from '@/types/reports/employee-summary';
import { escapeSelector, formatDataTable, sumTotalEmployees } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RenderRow from '../../util/render-row-in-table';
('../../until/render-row-in-table');

const TIPSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab, dataTmaSummary = [] } = props;

    const moduleName = props.moduleName + 'TIP';
    const moduleNameDetails = props.moduleName + 'TIPDetails';

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { section } = usePermissions('EmployeeDetails', 'EmployeeManagement');
    const { section: sectionClick } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const [dataList, setDataList] = useState<IUnitSummary[]>([]);

    let pathDetailEmployee = '';

    if (section) {
        pathDetailEmployee = pathnames.hrManagement.employeeManagement.detail.path;
    } else {
        pathDetailEmployee = pathnames.groupManagement.detail.path;
    }

    const TIPSummaryColumns: ColumnType<IUnitSummary>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'TIP',
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
            title: 'Total Employees',
            width: 170,
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'dc',
            title: 'Group',
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
            title: 'Group Employees',
            width: 170,
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => (
                <RenderRow
                    rows={record}
                    type="totalEmployee"
                    onRowChildren={sectionClick ? 'a' : 'div'}
                    generateUrl={doc =>
                        `${pathnames.reports.employeeSummaryReport.reportListFilter.path}/${doc.unitId}?unitName=${encodeURIComponent(doc.unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
                    }
                />
            )
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'managerNameChild',
            title: 'Manager',
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => (
                <RenderRow rows={record} type="managerName" onRowChildren="link" generateUrl={doc => `${pathDetailEmployee}/${doc.managerId}`} />
            )
        }
    ];

    useEffect(() => {
        const fetchDataList = async (params: IParamsList) => {
            turnOnLoading();
            try {
                // TIP Summary in DB is id 4
                const res = await employeeSummaryService.getUnitSummaryList({ ...params, customOrgChartReportStructureId: 4 }, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get tip list');
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
    }, [tab, currentTab, moduleName, showNotification, turnOffLoading, turnOnLoading]);

    return (
        // Hardcode data according to TMA Summary table
        <div id={`${escapeSelector(dataTmaSummary[4]?.orgChartReportTypeName)}_${currentTab}`} className="title-header-table">
            <h3 className="title">TIP Summary (Total Employee: {sumTotalEmployees(dataList)})</h3>
            <BaseTable
                columns={TIPSummaryColumns}
                dataSource={formatDataTable(dataList)}
                loading={isLoading}
                rootClassName="table-dg-summary-report"
                bordered
                pageSizeMax
                pagination={false}
                scroll={{ x: 1200, y: 400 }}
                className="table-virtual"
                virtual
            />
        </div>
    );
};

export default TIPSummary;
