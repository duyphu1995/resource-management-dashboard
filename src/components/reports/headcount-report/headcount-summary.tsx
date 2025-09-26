import BaseTable from '@/components/common/table/table';
import headcountReportServices from '@/services/reports/headcount';
import { IHeadcountData } from '@/types/reports/headcount-report';
import { formatDataTable } from '@/utils/common';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import {
    calculateTotalSharedServices,
    findSharedServiceUnitData,
    mapSharedServiceColumns,
    renderWithZeroCheck
} from '../headcount-baseline-report/headcount-baseline-common';
import dayjs from 'dayjs';
import { TIME_FORMAT } from '@/utils/constants';
import { renderWithFallback } from '@/components/common/table/render-data-table-common';

export const HeadcountSummaryReport = () => {
    const { showNotification } = useNotify();

    const [isLoading, setIsLoading] = useState(false);
    const [reportData, setReportData] = useState<IHeadcountData[]>([]);

    const handleHiddenValueTable = (item: number | '-', record: IHeadcountData, suffix: string = '') => {
        const { dcName } = record || {};

        if (dcName === 'DC over Total TMA Effort') {
            return null;
        }

        return renderWithZeroCheck(item) ? renderWithZeroCheck(item) + suffix : '';
    };

    const columns: TableColumnType<IHeadcountData>[] = [
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC/Group',
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
            render: (value, record) => (value !== 0 ? `${renderWithFallback(value)}${record.dcName === 'DC over Total TMA Effort' ? '%' : ''}` : '')
        },
        {
            dataIndex: 'totalEffort',
            key: 'totalEffort',
            title: 'Effort',
            width: 150,
            align: 'center',
            render: (value, record) => (value !== 0 ? `${renderWithFallback(value)}${record.dcName === 'DC over Total TMA Effort' ? '%' : ''}` : '')
        },
        {
            dataIndex: 'totalBillable',
            key: 'totalBillable',
            title: 'Billable',
            width: 150,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'totalNonBillable',
            key: 'totalNonBillable',
            title: 'NB',
            width: 150,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'totalNonBillableRatioPercent',
            key: 'totalNonBillableRatioPercent',
            title: 'NBR (%)',
            width: 150,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'totalNonBillableRatioStar',
            key: 'totalNonBillableRatioStar',
            title: 'NBR* (%) ',
            width: 150,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'staffGradeIndex',
            key: 'staffGradeIndex',
            title: 'Staff Grade Index',
            width: 150,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'productFactorValue',
            key: 'productFactorValue',
            title: 'Productivity Factor (%)',
            width: 180,
            align: 'center',
            render: (item, record) => handleHiddenValueTable(item, record, '%')
        },
        ...mapSharedServiceColumns(findSharedServiceUnitData(reportData), ['DC over Total TMA Effort']).map(item => ({
            ...item,
            align: 'center' as any
        })),
        {
            dataIndex: 'sharedServiceUnit',
            key: 'sharedServiceUnit',
            title: 'Total (Shared Services)',
            width: 205,
            render: item => calculateTotalSharedServices(item)
        },
        {
            dataIndex: 'inProbationEffort',
            key: 'inProbationEffort',
            title: 'In-Probations (A)',
            width: 200,
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'pendingResignationEffort',
            key: 'pendingResignationEffort',
            title: 'Pending Resignations (B)',
            width: 200,
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'adjustedEffort',
            key: 'adjustedEffort',
            title: 'Adjusted Effort (Excludes A & B)',
            width: 250,
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'adjustedNonBillable',
            key: 'adjustedNonBillable',
            title: 'Adjusted Nonbillable',
            width: 200,
            render: (item, record) => handleHiddenValueTable(item, record)
        },
        {
            dataIndex: 'adjustedNonBillableRatioPercent',
            key: 'adjustedNonBillableRatioPercent',
            title: 'Adjusted %NBR',
            width: 200,
            render: (item, record) => handleHiddenValueTable(item, record)
        }
    ];

    const rowClassName = (record: IHeadcountData) => {
        if (record.isDG) return 'table-row-BU';
        if (record.isSharedServiceUnit) return 'table-row-shared-service-unit';
        if (['Department Total', 'DC Total'].includes(record.dcName)) {
            return 'table-row-total';
        }
        if (['DC over Total TMA Effort', 'TMA Total'].includes(record.dcName)) {
            return 'table-row-total-effort';
        }

        return '';
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await headcountReportServices.getHeadcountData(3, 'HeadcountSummaryReport');
                const { data, succeeded } = response;

                if (succeeded) {
                    setReportData(formatDataTable(data) || []);
                }
            } catch (error) {
                showNotification(false, 'Failed to fetch headcount summary report.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [showNotification]);

    return (
        <div className="headcount-summary headcount-common">
            <p className="headcount-common__time">This report is generated at: {dayjs().format(TIME_FORMAT.GMT)}</p>
            <BaseTable dataSource={reportData} columns={columns} loading={isLoading} pagination={false} rowClassName={rowClassName} bordered />
        </div>
    );
};
