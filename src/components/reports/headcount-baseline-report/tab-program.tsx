import BaseTable from '@/components/common/table/table';
import { IReportTabProps } from '@/pages/reports/headcount-baseline-report';
import headcountBaselineService from '@/services/reports/headcount-baseline-report';
import { IBaselineHeadcountList } from '@/types/reports/headcount-baseline-report';
import { formatDataTable } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import useNotify from '@/utils/hook/useNotify';
import { TableColumnType } from 'antd';
import { useEffect, useState } from 'react';
import { calculateTotalSharedServices, findSharedServiceUnitData, mapSharedServiceColumns, renderWithZeroCheck } from './headcount-baseline-common';
import './index.scss';

const TabProgram = (props: IReportTabProps) => {
    const { searchParams, apply } = props;

    const { showNotification } = useNotify();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [data, setData] = useState<IBaselineHeadcountList[]>([]);

    const columns: TableColumnType<IBaselineHeadcountList>[] = [
        {
            dataIndex: 'dgName',
            key: 'dgName',
            title: ORG_UNITS.DG,
            width: 198,
            fixed: 'left',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'dcName',
            key: 'dcName',
            title: ORG_UNITS.DC,
            width: 198,
            fixed: 'left',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'programName',
            key: 'programName',
            title: ORG_UNITS.Program,
            width: 288,
            fixed: 'left',
            render: item => renderWithZeroCheck(item)
        },
        {
            dataIndex: 'totalHeadCount',
            key: 'totalHeadCount',
            title: 'Headcount',
            width: 128,
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
        ...mapSharedServiceColumns(findSharedServiceUnitData(data)),
        {
            key: 'totalSharedServices',
            title: 'Total (Shared Services)',
            width: 205,
            render: (record: IBaselineHeadcountList) => renderWithZeroCheck(calculateTotalSharedServices(record.sharedServiceUnit))
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
            width: 152,
            render: item => renderWithZeroCheck(item)
        }
    ];

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            turnOnLoading();
            try {
                const { week, year } = searchParams || {};
                const res = await headcountBaselineService.getHeadcountBaselineList({ week, year, unitTypeLevel: '2' }, 'HeadcountBaselinePrograms');

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

        if (searchParams.tab === 'HeadcountBaselinePrograms' && apply) fetchData();
    }, [searchParams, apply, turnOnLoading, turnOffLoading, showNotification]);

    return (
        <div>
            <div>
                <div>This report is generated at: {data[0]?.createdOn || 'N/A'}</div>
            </div>
            <BaseTable
                dataSource={formatDataTable(data)}
                style={{ marginTop: 12 }}
                columns={columns}
                loading={isLoading}
                pageSizeMax
                pagination={false}
                scroll={{ x: 1200, y: 549 }}
                className="table-virtual"
                bordered
                virtual
            />
        </div>
    );
};

export default TabProgram;
