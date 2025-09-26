import BaseBreadcrumb from '@/components/common/breadcrumb';
import DetailContent from '@/components/common/detail-management/detail-content';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import EmployeeProjectHeader from '@/components/reports/employee-project-header';
import pathnames from '@/pathnames';
import employeeProjectService from '@/services/reports/employee-project';
import { IEmployeeProjectInformation } from '@/types/reports/employee-project';
import { IOverviewItem } from '@/types/reports/monthly-delivery-statistic-report';
import { formatDataTable, formatTimeMonthDayYear } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { createSorter } from '@/utils/table';
import { TableColumnType } from 'antd';
import { BreadcrumbItemType } from 'antd/es/breadcrumb/Breadcrumb';
import { useEffect, useState } from 'react';
import './index.scss';

const EmployeeProjectPage = () => {
    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IEmployeeProjectInformation[]>([]);
    const [employeeProjectItems, setEmployeeProjectItems] = useState<IOverviewItem[]>([]);

    const pageTitle = pathnames.reports.employeeProjectReport.main.name;
    const breadcrumb: BreadcrumbItemType[] = [{ title: pathnames.reports.main.name }, { title: pageTitle }];

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const response = await employeeProjectService.getTableData();
                if (response.succeeded && response.data) {
                    const { items, totalEmployee, totalContractor } = response.data;
                    setData(formatDataTable(items));
                    setEmployeeProjectItems([
                        { value: totalEmployee, label: 'Total Employee' },
                        { value: totalContractor, label: 'Total Contractor' }
                    ]);
                }
            } catch {
                showNotification(false, 'Error fetching employee project data');
            } finally {
                turnOffLoading();
            }
        };

        fetchData();
    }, [turnOnLoading, turnOffLoading, showNotification]);

    const rowClassName = (row: IEmployeeProjectInformation, index: number) =>
        row.isContractor ? 'table-row-yellow' : index % 2 === 0 ? 'table-row-light' : 'table-row-dark';

    const columns: TableColumnType<IEmployeeProjectInformation>[] = [
        {
            key: 'badgeId',
            dataIndex: 'badgeId',
            title: 'Badge ID',
            width: 150,
            fixed: 'left',
            sorter: createSorter('badgeId'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'fullName',
            dataIndex: 'fullName',
            title: 'Full name',
            width: 300,
            fixed: 'left',
            sorter: createSorter('fullName'),
            render: (item, record) => <b style={{ color: record.statusColor }}>{renderWithFallback(item)}</b>
        },
        {
            key: 'email',
            dataIndex: 'email',
            title: 'Email',
            width: 300,
            render: item => renderWithFallback(item)
        },
        {
            key: 'joinDate',
            dataIndex: 'joinDate',
            title: 'Join Date',
            width: 200,
            sorter: createSorter('joinDate'),
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            key: 'location',
            dataIndex: 'location',
            title: 'Location',
            width: 200,
            sorter: createSorter('location'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'position',
            dataIndex: 'position',
            title: 'Position',
            width: 200,
            sorter: createSorter('position'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'grade',
            dataIndex: 'grade',
            title: 'Grade',
            width: 100,
            sorter: createSorter('grade', 'number'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'workingStatus',
            dataIndex: 'workingStatus',
            title: 'Working Status',
            width: 150,
            sorter: createSorter('workingStatus'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'project',
            dataIndex: 'project',
            title: ORG_UNITS.Project,
            width: 200,
            sorter: createSorter('project'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'dcGroup',
            dataIndex: 'dcGroup',
            title: `${ORG_UNITS.DC}/Group`,
            width: 200,
            sorter: createSorter('dcGroup'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'dg',
            dataIndex: 'dg',
            title: ORG_UNITS.DG,
            width: 200,
            sorter: createSorter('dg'),
            render: item => renderWithFallback(item)
        },
        {
            key: 'projectManager',
            dataIndex: 'projectManager',
            title: 'Project Manager',
            width: 300,
            sorter: createSorter('projectManager'),
            render: item => renderWithFallback(item)
        }
    ];

    return (
        <DetailContent>
            <div className="employee-project-report-container">
                <BaseBreadcrumb dataItem={breadcrumb} />
                <h3 className="page-title">{pageTitle}</h3>
                <EmployeeProjectHeader items={employeeProjectItems} />
                <BaseTable
                    dataSource={data}
                    style={{ marginTop: 12 }}
                    columns={columns}
                    loading={isLoading}
                    // rowKey="badgeId"
                    rowClassName={rowClassName}
                />
            </div>
        </DetailContent>
    );
};

export default EmployeeProjectPage;
