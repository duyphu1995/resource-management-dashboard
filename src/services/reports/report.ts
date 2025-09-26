import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IMostRecentHaveData, IReportIndexes } from '@/types/reports/report';

const apiURL = '/report';

const reportService = {
    getAllIndexes: (): Promise<IResponse<IReportIndexes>> => {
        const url = apiURL + `/allIndex`;
        return axiosClient.get(url);
    },

    getMostRecentHaveData: (): Promise<IResponse<IMostRecentHaveData[]>> => {
        const url = apiURL + `/get-the-most-recent-have-data`;
        return axiosClient.get(url);
    }
};

export default reportService;
