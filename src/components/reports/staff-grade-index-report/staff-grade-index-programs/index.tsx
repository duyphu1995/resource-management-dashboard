import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { IStaffGradeFilterParams } from '@/pages/reports/staff-grade-index-report';
import staffGradeIndexReportService, { GroupLevel } from '@/services/reports/staff-grade-index-report';
import type { IStaffGradeIndexReport } from '@/types/reports/staff-grade-index-report';
import { formatDataTable } from '@/utils/common';
import { ORG_UNITS } from '@/utils/constants';
import useLoading from '@/utils/hook/useLoading';
import Title from 'antd/es/typography/Title';
import StaffGradeIndexReportProgramTable from './table';
interface StaffGradeIndexProgramsProps {
    filterParams: IStaffGradeFilterParams;
}

const StaffGradeIndexPrograms = ({ filterParams }: StaffGradeIndexProgramsProps) => {
    const navigation = useNavigate();
    const { isLoading, turnOnLoading, turnOffLoading } = useLoading();

    const [reportData, setReportData] = useState<IStaffGradeIndexReport[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (filterParams.unitTypeLevel !== GroupLevel.Program.toString()) return;
            try {
                turnOnLoading();
                const { succeeded, data } = await staffGradeIndexReportService.getTableData(filterParams.year, filterParams.week, GroupLevel.Program);
                if (succeeded && data) {
                    setReportData(formatDataTable(data));
                }
            } catch (error) {
                setReportData([]);
            } finally {
                turnOffLoading();
            }
        };
        fetchData();
    }, [filterParams, navigation, turnOnLoading, turnOffLoading]);

    return (
        <div>
            <div style={{ paddingTop: 24 }}>This report is generated at: {reportData[0]?.createdOn || 'N/A'}</div>
            <Title level={3} style={{ paddingTop: 24 }}>
                Staff Grade Index {ORG_UNITS.Program}
            </Title>
            <StaffGradeIndexReportProgramTable data={reportData} loading={isLoading} />
        </div>
    );
};

export default StaffGradeIndexPrograms;
