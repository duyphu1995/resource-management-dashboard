import { IResponse } from '@/types/common';
import { IKpiReports } from '@/types/reports/kpi';
import axiosClient from '../axios-client';

const apiURL = '/report';

const kpiReports = {
    // Get data
    getKpiReports: (fromDate = '', toDate = ''): Promise<IResponse<IKpiReports[]>> => {
        const url = apiURL + `/kpireport?fromDate=${fromDate}&toDate=${toDate}`;
        return axiosClient.get(url);
    }
};

export default kpiReports;
