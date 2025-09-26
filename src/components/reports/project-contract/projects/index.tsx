import { useEffect, useState } from 'react';
import { TableColumnsType } from 'antd';
import useNotify from '@/utils/hook/useNotify';
import { formatDataTableFromOne, formatNumberWithDecimalPlaces, formatTimeMonthDayYear } from '@/utils/common';
import BaseTable from '@/components/common/table/table';
import projectContractReportServices from '@/services/reports/project-contract';
import { IFilterDataChildren, IProjects } from '@/types/reports/project-contract';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';

const Projects = ({ filterData }: { filterData?: IFilterDataChildren }) => {
    const { showNotification } = useNotify();

    const [dataReport, setDataReport] = useState<IProjects[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const renderValueColumn = (value: number | string) =>
        typeof value === 'number' ? formatNumberWithDecimalPlaces(value) : renderWithFallback(value);

    const columns: TableColumnsType<IProjects> = [
        {
            dataIndex: 'key',
            key: 'key',
            title: '#',
            width: 50,
            align: 'center',
            fixed: 'left',
            render: renderValueColumn
        },
        {
            dataIndex: 'projectContractName',
            key: 'projectContractName',
            title: 'Contract ID',
            width: 200,
            fixed: 'left',
            render: renderValueColumn
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU Name',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC Name',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Project Name',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'projectManager',
            key: 'projectManager',
            title: 'PM Name',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'status',
            key: 'status',
            title: 'Status',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'countryName',
            key: 'countryName',
            title: 'Country (Headquater)',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'marketplaceGroupName',
            key: 'marketplaceGroupName',
            title: 'Market',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'customerName',
            key: 'customerName',
            title: 'CustomerName',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'projectTypeName',
            key: 'projectTypeName',
            title: 'Project Type',
            width: 200,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'totalHeadcount',
            key: 'totalHeadcount',
            title: 'Current Project Size (HC)',
            width: 210,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'totalBillable',
            key: 'totalBillable',
            title: 'Current Project Billable',
            width: 200,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'startDate',
            key: 'startDate',
            title: 'Start Date',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'endDate',
            key: 'endDate',
            title: 'End Date',
            width: 150,
            align: 'center',
            render: item => renderWithFallback(formatTimeMonthDayYear(item))
        },
        {
            dataIndex: 'technology',
            key: 'technology',
            title: 'Technologies',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'approvedEffort',
            key: 'approvedEffort',
            title: 'Contract Approved Effort',
            width: 220,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'contractBillable',
            key: 'contractBillable',
            title: 'Contracted Billable',
            width: 220,
            align: 'center',
            render: renderValueColumn
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await projectContractReportServices.getProjectByContract(filterData);
                const { succeeded, data } = response;

                if (succeeded) {
                    setDataReport(formatDataTableFromOne(data || []));
                }
            } catch (error) {
                showNotification(false, 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [filterData, showNotification]);

    return <BaseTable columns={columns} dataSource={dataReport} pagination={false} loading={isLoading} bordered />;
};

export default Projects;
