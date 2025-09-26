import BaseTable from '@/components/common/table/table';
import { IReportTabProps } from '@/pages/reports/headcount-baseline-report';
import headcountBaselineService from '@/services/reports/headcount-baseline-report';
import { IBaselineHeadcountList } from '@/types/reports/headcount-baseline-report';
import { formatDataTable } from '@/utils/common';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import { calculateTotalSharedServices, findSharedServiceUnitData, mapSharedServiceColumns, renderWithZeroCheck } from './headcount-baseline-common';
import './index.scss';

const TabDCAndDG = (props: IReportTabProps) => {
    const { searchParams, apply } = props;

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IBaselineHeadcountList[]>([]);

    const columns: TableColumnType<IBaselineHeadcountList>[] = [
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: 'DC/Group',
            width: 237,
            fixed: 'left',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Headcount',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalEffort',
            key: 'totalEffort',
            title: 'Effort',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalBillable',
            key: 'totalBillable',
            title: 'Billable',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillable',
            key: 'totalNonBillable',
            title: 'NB',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillableRatioPercent',
            key: 'totalNonBillableRatioPercent',
            title: 'NBR',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalNonBillableRatioStar',
            key: 'totalNonBillableRatioStar',
            title: 'NBR*',
            width: 120,
            render: item => renderWithZeroCheck(item)
        },
        ...mapSharedServiceColumns(findSharedServiceUnitData(data), ['DC over Total TMA Effort']),
        {
            dataIndex: 'sharedServiceUnit',
            key: 'totalSharedServices',
            title: 'Total (Shared Services)',
            width: 205,
            render: item => calculateTotalSharedServices(item)
        },
        {
            dataIndex: 'inProbationEffort',
            key: 'inProbationEffort',
            title: 'In-Probation (A)',
            width: 156,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'pendingResignationEffort',
            key: 'pendingResignationEffort',
            title: 'Pending Resignation (B)',
            width: 209,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'adjustedEffort',
            key: 'adjustedEffort',
            title: 'Adjusted Effort (Exclude A & B)',
            width: 256,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'adjustedNonBillable',
            key: 'adjustedNonBillable',
            title: 'Adjusted Nonbillable',
            width: 187,
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'adjustedNonBillableRatioPercent',
            key: 'adjustedNonBillableRatioPercent',
            title: 'Adjusted %NBR',
            width: 152
        }
    ];

    const rowClassNameCustom = (record: IBaselineHeadcountList, index: number) => {
        const { isDG, isDGTotal, isTMATotal, isSharedServiceUnit } = record;

        const alternatingColor = index % 2 === 0 ? 'table-row-light' : 'table-row-dark';
        const customClass =
            (isDG && 'dg-color-bg') ||
            (isDGTotal && 'dg-total-color-bg') ||
            (isSharedServiceUnit && 'share-service-color-bg') ||
            (isTMATotal && 'tma-total-color-bg') ||
            '';

        return customClass || alternatingColor;
    };

    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const { week, year } = searchParams || {};
                const res = await headcountBaselineService.getHeadcountBaselineList({ week, year, unitTypeLevel: '3' }, 'HeadcountBaselineDCBU');
                const { succeeded, data } = res;

                if (succeeded && data) {
                    setData(data);
                }
            } catch (error) {
                showNotification(false, 'Error fetching headcount baseline report');
            } finally {
                turnOffLoading();
            }
        };

        if (searchParams.tab === 'HeadcountBaselineDCBU' && apply) fetchData();
    }, [searchParams, apply, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <div>
            <div>This report is generated at: {data[0]?.createdOn || 'N/A'}</div>
            <BaseTable
                dataSource={formatDataTable(data)}
                style={{ marginTop: 12 }}
                columns={columns}
                loading={isLoading}
                rowClassName={rowClassNameCustom}
                pageSizeMax
                pagination={false}
                scroll={{ x: 1200, y: 549 }}
                className="table-dc-dg table-virtual"
                bordered
                virtual
            />
        </div>
    );
};

export default TabDCAndDG;
