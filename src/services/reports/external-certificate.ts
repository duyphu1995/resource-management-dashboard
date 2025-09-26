import { IResponse } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IExternalCertificateStatistic, IExternalCertificateSummaryReport } from '@/types/reports/external-certificate';
import axiosClient from '../axios-client';

const apiURL = '/report/external-certificate-report/';

const externalCertificateReportService = {
    getSummaryReport: (params: any): Promise<IResponse<IExternalCertificateSummaryReport[]>> => {
        const url = apiURL + `summary`;
        return axiosClient.post(url, params);
    },

    getEmployeeList: (params: any): Promise<IResponse<IEmployee[]>> => {
        const url = apiURL + `employee-list`;
        return axiosClient.post(url, params);
    },

    getStatisticReport: (params: any): Promise<IResponse<IExternalCertificateStatistic[]>> => {
        const url = apiURL + `statistic`;
        return axiosClient.post(url, params);
    },

    export: (params: any): Promise<IResponse> => {
        const url = apiURL + `export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    }
};

export default externalCertificateReportService;
