import { IResponse } from '@/types/common';
import {
    IAttrition,
    IByDGs,
    IMonthlyIndex,
    IMonthlyStatistic,
    IMonthlyStatisticFilterData,
    IResignationListReport,
    ISharedServicesUnit,
    IStaffGradeIndex
} from '@/types/reports/monthly-delivery-statistic-report';
import axiosClient from '../axios-client';

const apiURL = 'report';

const monthlyDeliveryStatisticReportService = {
    getAllIndex(): Promise<IResponse<IMonthlyIndex>> {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    getResignationMonthlyStatistic: (params: IMonthlyStatisticFilterData): Promise<IResponse<IMonthlyStatistic>> => {
        const url = apiURL + `/monthlyStatistic/resignation?year=${params.year}&month=${params.month}`;
        return axiosClient.get(url);
    },

    getAttritionMonthlyStatistic: (params: IMonthlyStatisticFilterData): Promise<IResponse<IAttrition[]>> => {
        const url = apiURL + `/monthlyStatistic/attrition?year=${params.year}&month=${params.month}`;
        return axiosClient.get(url);
    },

    getResignationList: (params: IResignationListReport): Promise<IResponse<IResignationListReport[]>> => {
        const url = apiURL + `/monthlyStatistic/resignationData`;
        return axiosClient.post(url, params);
    },

    getStaffGradeIndex: (params: IMonthlyStatisticFilterData): Promise<IResponse<IStaffGradeIndex[]>> => {
        const url = apiURL + `/monthlyStatistic/staffGradeIndex?year=${params.year}&month=${params.month}`;
        return axiosClient.get(url);
    },

    getBillableGrowthByDG: (params: IMonthlyStatisticFilterData): Promise<IResponse<IByDGs[]>> => {
        const url = apiURL + `/monthlyStatistic/billable/DGs?year=${params.year}&month=${params.month}`;
        return axiosClient.get(url);
    },

    getBillableGrowthByShareService: (params: IMonthlyStatisticFilterData): Promise<IResponse<ISharedServicesUnit[]>> => {
        const url = apiURL + `/monthlyStatistic/billable/sharedService?year=${params.year}&month=${params.month}`;
        return axiosClient.get(url);
    },

    export: (params: any): Promise<IResponse> => {
        const url = apiURL + `/monthlyStatistic/resignationData/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    }
};

export default monthlyDeliveryStatisticReportService;
