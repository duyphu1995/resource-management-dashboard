import { renderWithFallback } from '@/components/common/table/render-data-table-common';
import BaseTable from '@/components/common/table/table';
import headcountReportServices from '@/services/reports/headcount';
import { IHeadcountData } from '@/types/reports/headcount-report';
import { formatDataTable } from '@/utils/common';
import { TIME_FORMAT } from '@/utils/constants';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnType } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
    calculateTotalSharedServices,
    findSharedServiceUnitData,
    mapSharedServiceColumns,
    renderWithZeroCheck
} from '../headcount-baseline-report/headcount-baseline-common';

export const HeadcountDetailsReport = () => {
    const { showNotification } = useNotify();

    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<IHeadcountData[]>([]);

    const columns: TableColumnType<IHeadcountData>[] = [
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: 'BU/Dept. Group',
            width: 200,
            fixed: 'left',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC/Group',
            width: 200,
            fixed: 'left',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'projectName',
            key: 'projectName',
            title: 'Project/Department',
            width: 200,
            fixed: 'left',
            render: value => renderWithFallback(value)
        },
        {
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Headcount',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalEffort',
            key: 'totalEffort',
            title: 'Effort',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalBillable',
            key: 'billable',
            title: 'Billable',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillable',
            key: 'totalNonBillable',
            title: 'NB',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillableRatioPercent',
            key: 'totalNonBillableRatioPercent',
            title: 'NBR',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillableRatioStar',
            key: 'totalNonBillableRatioStar',
            title: 'NBR* ',
            width: 150,
            align: 'center',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'staffGradeIndex',
            key: 'staffGradeIndex',
            title: 'Staff Grade Index*',
            width: 150,
            align: 'center',
            render: (value, record) => (record.isSharedServiceUnit ? '' : renderWithZeroCheck(value))
        },
        {
            dataIndex: 'productFactorValue',
            key: 'productFactorValue',
            title: 'Productivity Factor',
            width: 180,
            align: 'center',
            render: (value, record) => (record.isSharedServiceUnit ? '' : renderWithZeroCheck(value))
        },
        ...mapSharedServiceColumns(findSharedServiceUnitData(reportData), ['DC over Total TMA Effort']).map(item => ({
            ...item,
            align: 'center' as any
        })),
        {
            dataIndex: 'sharedServiceUnit',
            key: 'totalSharedServices',
            title: 'Total (Shared Services)',
            width: 205,
            render: item => calculateTotalSharedServices(item)
        },
        {
            dataIndex: 'remakes',
            key: 'remakes',
            title: 'Remarks (Effort <= 10 > Small Project)',
            width: 300,
            render: item => renderWithFallback(item)
        }
    ];

    const rowClassName = (record: IHeadcountData, index: number): string => {
        const sharedServiceClass = record.isSharedServiceUnit ? 'table-row-shared-service-unit' : '';
        const dgClass = record.isDG ? 'table-row-dg' : '';
        const rowClass = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';

        return `${sharedServiceClass} ${dgClass} ${rowClass}`.trim();
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await headcountReportServices.getHeadcountData(1, 'HeadcountDetailsReport');
                const { data, succeeded } = response;

                if (succeeded) {
                    setReportData(formatDataTable(data) || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch headcount details report.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [showNotification]);

    return (
        <div className="headcount-details headcount-common">
            <p className="headcount-common__time">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</p>
            <BaseTable dataSource={reportData} columns={columns} loading={isLoading} pagination={false} rowClassName={rowClassName} bordered />
        </div>
    );
};
