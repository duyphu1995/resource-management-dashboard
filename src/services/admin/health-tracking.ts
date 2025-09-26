import { IAdminHealthTracking } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/healthtracking/certificate';

const healthTrackingService = {
    getAll: (moduleName: string = 'HealthTracking'): Promise<IResponse<IAdminHealthTracking[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    getDetail: (certificateId: string): Promise<IResponse<IAdminHealthTracking>> => {
        const url = apiURL + '/' + certificateId;
        return axiosClient.get(url);
    },

    add: (params: IAdminHealthTracking): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminHealthTracking): Promise<IResponse> => {
        const url = apiURL + '/' + params.certificateId;
        return axiosClient.put(url, params);
    },

    delete: (certificateId: number): Promise<IResponse> => {
        const url = apiURL + '/' + certificateId;
        return axiosClient.delete(url);
    }
};

export default healthTrackingService;
