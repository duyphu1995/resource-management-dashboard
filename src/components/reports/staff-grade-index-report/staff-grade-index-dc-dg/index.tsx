import type { IStaffGradeFilterParams } from '@/pages/reports/staff-grade-index-report';
import staffGradeIndexReportService, { GroupLevel } from '@/services/reports/staff-grade-index-report';
import { IEffortGradeSummaryChart, type IStaffGradeIndexReport } from '@/types/reports/staff-grade-index-report';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import Title from 'antd/es/typography/Title';
import { useCallback, useEffect, useState } from 'react';
import ChartMixLineBar from './chart-mix-line-bar';
import StaffGradeIndexReportDcDGTable from './table';

interface StaffGradeIndexDcDGProps {
    filterParams: IStaffGradeFilterParams;
}

const StaffGradeIndexDcDG = ({ filterParams }: StaffGradeIndexDcDGProps) => {
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [reportData, setReportData] = useState<IStaffGradeIndexReport[]>([]);
    const [chartData, setChartData] = useState<IEffortGradeSummaryChart[]>([]);

    const fetchData = useCallback(async () => {
        if (filterParams.unitTypeLevel !== GroupLevel.DcDG.toString()) return;
        try {
            turnOnLoading();
            const { succeeded, data } = await staffGradeIndexReportService.getTableData(filterParams.year, filterParams.week, GroupLevel.DcDG);
            if (succeeded && data) {
                setReportData(data);
            }
        } catch (error) {
            setReportData([]);
        } finally {
            turnOffLoading();
        }
    }, [filterParams, turnOnLoading, turnOffLoading]);

    const fetchChartData = useCallback(async () => {
        if (filterParams.unitTypeLevel !== GroupLevel.DcDG.toString()) return;
        try {
            turnOnLoading();
            const { succeeded, data } = await staffGradeIndexReportService.getChartData(filterParams.year, filterParams.week);
            if (succeeded && data) {
                setChartData(data);
            }
        } catch (error) {
            setChartData([]);
        } finally {
            turnOffLoading();
        }
    }, [filterParams, turnOnLoading, turnOffLoading]);

    useEffect(() => {
        fetchData();
        fetchChartData();
    }, [fetchData, fetchChartData]);

    return (
        <div>
            <div style={{ padding: '24px 0' }}>This report is generated at: {reportData[0]?.createdOn || 'N/A'}</div>
            <Title level={3}>Effort Grade Summary Chart</Title>
            <ChartMixLineBar data={chartData} isLoading={isLoading} getFieldValue="effortGrade" titleChart="Effort Grade Summary Chart" totalBox />
            <div className="line-gray" />
            <Title level={3} style={{ paddingTop: 24 }}>
                Grade Summary Chart
            </Title>
            <ChartMixLineBar data={chartData} isLoading={isLoading} getFieldValue="grade" titleChart="Grade Summary Chart" />
            <div className="line-gray" />
            <Title level={3} style={{ paddingTop: 24 }}>
                {reportData.length !== 0
                    ? `Staff Grade Index ${ORG_UNITS.DC}/${ORG_UNITS.DG}`
                    : `Baseline Staff Grade Index Reports - Staff Grade Index ${ORG_UNITS.DC}/${ORG_UNITS.DG}`}
            </Title>
            <StaffGradeIndexReportDcDGTable data={reportData} loading={isLoading} />
        </div>
    );
};

export default StaffGradeIndexDcDG;
