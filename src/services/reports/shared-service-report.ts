import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IParamsSharedServiceReport, ISummarySharedServiceReport } from '@/types/reports/shared-service-report';

const apiURL = '/report';

const sharedServiceReport = {
    getListSummarySharedService: (params: IParamsSharedServiceReport): Promise<IResponse<ISummarySharedServiceReport[]>> => {
        const url = `${apiURL}/shared-service-summary`;
        return axiosClient.get(url, { params });
    },

    getListDetailsBySharedService: (params: IParamsSharedServiceReport): Promise<IResponse<ISummarySharedServiceReport[]>> => {
        const url = `${apiURL}/shared-service-detail`;
        return axiosClient.get(url, { params });
    },

    getListDetailsByDcDg: (params: IParamsSharedServiceReport): Promise<IResponse<ISummarySharedServiceReport[]>> => {
        const url = `${apiURL}/shared-service-by-unit`;
        return axiosClient.get(url, { params });
    }
};

export default sharedServiceReport;
