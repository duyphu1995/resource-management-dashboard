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
import RenderRow from '../../util/render-row-in-table';
('../../until/render-row-in-table');

interface ISupportSummaryProps extends ITabEmployeeSummaryProps {}

const SupportSummary = (props: ISupportSummaryProps) => {
    const { tab, currentTab, dataTmaSummary = [] } = props;

    const moduleName = props.moduleName + 'Support';
    const moduleNameDetails = props.moduleName + 'SupportDetails';

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

    const supportSummaryColumns: ColumnType<IUnitSummary>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: 'Support',
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: item => renderWithFallback(item)
        },
        {
            dataIndex: 'managerName',
            key: 'managerName',
            title: 'Manager',
            width: 200,
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: item => renderWithFallback(item)
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
            title: 'DC/Group',
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => <RenderRow rows={record} type="groupName" />
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'dc',
            title: 'Name',
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
            title: 'Total Project Employees',
            className: 'table-padding-0',
            width: 200,
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
            title: 'Project Manager',
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
                // Support Summary in DB is id 5
                const res = await employeeSummaryService.getUnitSummaryList({ ...params, customOrgChartReportStructureId: 5 }, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get position list');
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
        <div id={`${escapeSelector(dataTmaSummary[5]?.orgChartReportTypeName)}_${currentTab}`} className="title-header-table">
            <h3 className="title">Support (Total Employee: {sumTotalEmployees(dataList)})</h3>
            <BaseTable
                columns={supportSummaryColumns}
                dataSource={formatDataTable(dataList)}
                loading={isLoading}
                rootClassName="table-dg-summary-report"
                bordered
                pageSizeMax
                pagination={false}
                scroll={{ x: 1200, y: 600 }}
                className="table-virtual"
                virtual
            />
        </div>
    );
};

export default SupportSummary;
