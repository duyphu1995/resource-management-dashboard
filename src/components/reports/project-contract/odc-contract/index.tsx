import { useEffect, useState } from 'react';
import { TableColumnsType } from 'antd';
import useNotify from '@/utils/hook/useNotify';
import { formatDataTable, formatNumberWithDecimalPlaces, formatTimeMonthDayYear } from '@/utils/common';
import BaseTable from '@/components/common/table/table';
import projectContractReportServices from '@/services/reports/project-contract';
import { IFilterDataChildren, IProjectContractByType } from '@/types/reports/project-contract';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import './index.scss';

const ODCContract = ({ filterData }: { filterData?: IFilterDataChildren }) => {
    const { showNotification } = useNotify();

    const [dataReport, setDataReport] = useState<IProjectContractByType[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const renderValueColumn = (value: number | string) =>
        typeof value === 'number' ? formatNumberWithDecimalPlaces(value) : renderWithFallback(value);

    const columns: TableColumnsType<IProjectContractByType> = [
        {
            dataIndex: 'projectContractName',
            key: 'projectContractName',
            title: 'Contract ID',
            width: 200,
            fixed: 'left',
            render: renderValueColumn
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Intranet Project Name',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'dgManager',
            key: 'dgManager',
            title: 'BU Head',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'dcManager',
            key: 'dcManager',
            title: 'DC Director',
            width: 250,
            render: renderValueColumn
        },
        {
            dataIndex: 'accountManager',
            key: 'accountManager',
            title: 'Account Manager',
            width: 200,
            render: renderValueColumn
        },
        {
            dataIndex: 'projectTypeName',
            key: 'projectTypeName',
            title: 'Type',
            width: 150,
            render: renderValueColumn
        },
        {
            dataIndex: 'statusName',
            key: 'statusName',
            title: 'Status',
            width: 100,
            render: renderValueColumn
        },
        {
            dataIndex: 'customerName',
            key: 'customerName',
            title: 'Customer Name',
            width: 200,
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
            width: 100,
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
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Current Project Size (HC)',
            width: 220,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'contractBillable',
            key: 'contractBillable',
            title: 'Contracted Billable',
            width: 160,
            align: 'center',
            render: renderValueColumn
        },
        {
            dataIndex: 'totalNonBillableRatio',
            key: 'totalNonBillableRatio',
            title: '%NBR',
            width: 200,
            align: 'center',
            render: renderValueColumn
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await projectContractReportServices.getProjectContractByType('ODC', filterData);
                const { succeeded, data } = response;

                if (succeeded) {
                    setDataReport(formatDataTable(data || []));
                }
            } catch (error) {
                showNotification(false, 'Failed to load data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [filterData, showNotification]);

    const rowClassName = ({ projectTypeName }: IProjectContractByType, index: number): string => {
        const baseClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';

        return projectTypeName === 'Contract' ? `${baseClass} row-highlight` : baseClass;
    };

    return (
        <BaseTable
            columns={columns}
            dataSource={dataReport}
            pagination={false}
            loading={isLoading}
            bordered
            rowClassName={rowClassName}
            className="odc-contract"
        />
    );
};

export default ODCContract;
