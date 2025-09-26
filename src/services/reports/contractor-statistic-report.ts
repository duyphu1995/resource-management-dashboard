import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IContractorStatisticReport } from '@/types/reports/contractor-statistic-report';

const apiURL = '/report/contractor-statistic';

const contractorStatisticReportServices = {
    getContractorStatisticReportData: (params: any): Promise<IResponse<IContractorStatisticReport>> => {
        return axiosClient.post(apiURL, params);
    }
};

export default contractorStatisticReportServices;
