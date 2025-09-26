import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import pathnames from '@/pathnames';
import employeeSummaryService from '@/services/reports/employee-summary';
import { IParamsList, ITabEmployeeSummaryProps, IUnitSummary } from '@/types/reports/employee-summary';
import { formatDataTable, handleClickViewListOfNewWindow, sumTotalEmployees } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import usePermissions from '@/utils/hook/usePermissions';
import { ColumnType } from 'antd/es/table';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RenderRow from '../../util/render-row-in-table';

const DCSummary = (props: ITabEmployeeSummaryProps) => {
    const { tab, currentTab } = props;

    const moduleName = props.moduleName + 'DCList';
    const moduleNameDetails = props.moduleName + 'DCListDetails';

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();
    const { section } = usePermissions('EmployeeDetails', 'EmployeeManagement');
    const { section: sectionClick } = usePermissions(moduleNameDetails, 'EmployeeSummary');

    const [dataList, setDataList] = useState<IUnitSummary[]>([]);

    const isContractor = currentTab === 'ContractorSummary';
    const titleTotal = isContractor ? 'DC Summary (Total Contractor:' : 'DC Detail (Total Employee:';

    let pathDetailEmployee = '';

    if (section) {
        pathDetailEmployee = pathnames.hrManagement.employeeManagement.detail.path;
    } else {
        pathDetailEmployee = pathnames.groupManagement.detail.path;
    }

    const dcSummaryColumns: ColumnType<IUnitSummary>[] = [
        {
            dataIndex: 'unitName',
            key: 'unitName',
            title: ORG_UNITS.DC,
            fixed: 'left',
            width: 250,
            align: 'center',
            onCell: () => ({
                className: 'align-center'
            }),
            render: (item, record) => (
                <Link to={pathnames.groupManagement.main.path + `/${record.isNonUnit ? 1 : record.unitId}`} target="_blank" className="underline">
                    {renderWithFallback(item)}
                </Link>
            )
        },
        {
            dataIndex: 'managerName',
            key: 'managerName',
            title: 'Manager',
            width: 250,
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
            title: `Total ${ORG_UNITS.DC} ${isContractor ? 'Contractors' : 'Employee'}`,
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
                                `${pathnames.reports.employeeSummaryReport.reportListFilter.path}/${record.isNonUnit ? 1 : record.unitId}?unitName=${encodeURIComponent(record.unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
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
            render: (record: IUnitSummary[]) => <RenderRow rows={record} type="groupName" />
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'dc',
            title: ORG_UNITS.Project,
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => (
                <RenderRow
                    rows={record}
                    type="unitName"
                    onRowChildren="link"
                    generateUrl={doc => `${pathnames.groupManagement.main.path}/${doc.isNonUnit ? 1 : doc.unitId}`}
                />
            )
        },
        {
            dataIndex: 'childUnitSummary',
            key: 'totalEmployeeChild',
            title: `Total ${ORG_UNITS.Project} ${isContractor ? 'Contractors' : 'Employee'}`,
            width: 200,
            className: 'table-padding-0',
            align: 'center',
            render: (record: IUnitSummary[]) => (
                <RenderRow
                    rows={record}
                    type="totalEmployee"
                    onRowChildren={sectionClick ? 'a' : 'div'}
                    generateUrl={doc =>
                        `${pathnames.reports.employeeSummaryReport.reportListFilter.path}/${doc.isNonUnit ? 1 : doc.unitId}?unitName=${encodeURIComponent(doc.unitName)}&tab=${tab}&moduleName=${moduleNameDetails}`
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
                const res = await employeeSummaryService.getDCSummaryList(params, moduleName);
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setDataList(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching get dc list');
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
        <div className="title-header-table">
            <h3 className="title">{`${titleTotal} ${sumTotalEmployees(dataList)})`}</h3>
            <BaseTable
                columns={dcSummaryColumns}
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

export default DCSummary;
