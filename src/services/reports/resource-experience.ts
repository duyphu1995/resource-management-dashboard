import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import {
    IChartExperienceDetail,
    IParamsChartExperienceDetail,
    IStaffGradeProgramTable,
    IStaffGradeProjectTable,
    IStaffGradeSummaryTable,
    IYearOfExperienceSummary
} from '@/types/reports/resource-experience';

const apiURL = 'report/resource-experience';

const resourceExperienceServices = {
    getStaffGradeIndex: (
        unitTypeLevel: '1' | '2' | '3'
    ): Promise<IResponse<IStaffGradeSummaryTable[] | IStaffGradeProjectTable[] | IStaffGradeProgramTable[]>> => {
        const url = `${apiURL}/staffgradeindex`;
        return axiosClient.get(url, { params: { unitTypeLevel } });
    },

    getYearExperience: (unitTypeLevel: '1' | '3'): Promise<IResponse<IYearOfExperienceSummary[]>> => {
        const url = `${apiURL}/year-experience`;
        return axiosClient.get(url, { params: { unitTypeLevel } });
    },

    getChartExperience: (params?: IParamsChartExperienceDetail): Promise<IResponse<IChartExperienceDetail>> => {
        const url = `${apiURL}/chart-experience`;
        return axiosClient.get(url, { params });
    }
};

export default resourceExperienceServices;
