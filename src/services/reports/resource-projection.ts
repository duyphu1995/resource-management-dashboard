import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IReportList, IReportListParams } from '@/types/reports/resource-projection';

const apiURL = 'report/resource-projection';

const resourceProjectionServices = {
    getReportList: (params: IReportListParams): Promise<IResponse<IReportList[]>> => {
        return axiosClient.get(apiURL, { params });
    }
};

export default resourceProjectionServices;
