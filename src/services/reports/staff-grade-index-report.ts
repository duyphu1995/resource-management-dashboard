import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IEffortGradeSummaryChart, IExportStaffGradeIndexParams, IStaffGradeIndexReport } from '@/types/reports/staff-grade-index-report';

const apiURL = 'report/staffGradeIndex';
const apiChart = 'report/totalStaffGradeIndex';

export enum GroupLevel {
    Project = 1,
    Program = 2,
    DcDG = 3
}

const staffGradeIndexReportService = {
    getTableData: (fromDate: string, toDate: string, groupType: GroupLevel): Promise<IResponse<IStaffGradeIndexReport[]>> => {
        const url = `${apiURL}?year=${fromDate}&week=${toDate}&unitTypeLevel=${groupType}`;
        return axiosClient.get(url);
    },
    exportExcel: (params: IExportStaffGradeIndexParams): Promise<BlobPart> => {
        const url = `${apiURL}/export?from=${params.fromDate}&to=${params.toDate}&unitTypeLevel=${params.unitTypeLevel}`;
        return axiosClient({
            url: url,
            method: 'POST',
            responseType: 'blob'
        });
    },
    getChartData: (fromDate: string, toDate: string): Promise<IResponse<IEffortGradeSummaryChart[]>> => {
        const url = `${apiChart}?year=${fromDate}&week=${toDate}`;
        return axiosClient.get(url);
    }
};

export default staffGradeIndexReportService;
