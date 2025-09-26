import { IAdminTerminationReason } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/reasonforleave';

const terminationReasonService = {
    getAll: (): Promise<IResponse<IAdminTerminationReason[]>> => {
        const url = apiURL + '/getall';
        return axiosClient.get(url);
    },

    getDetail: (reasonId: string): Promise<IResponse<IAdminTerminationReason>> => {
        const url = apiURL + '/' + reasonId;
        return axiosClient.get(url);
    },

    add: (params: IAdminTerminationReason): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminTerminationReason): Promise<IResponse> => {
        const url = apiURL + '/' + params.reasonId;
        return axiosClient.put(url, params);
    },

    delete: (reasonId: number): Promise<IResponse> => {
        const url = apiURL + '/' + reasonId;
        return axiosClient.delete(url);
    }
};

export default terminationReasonService;
