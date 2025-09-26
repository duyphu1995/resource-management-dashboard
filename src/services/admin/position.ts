import { IAdminPosition } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/position';

const positionService = {
    getAll: (moduleName: string = 'Position'): Promise<IResponse<IAdminPosition[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    getDetail: (positionId: string): Promise<IResponse<IAdminPosition>> => {
        const url = apiURL + '/' + positionId;
        return axiosClient.get(url);
    },

    add: (params: IAdminPosition): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminPosition): Promise<IResponse> => {
        const url = apiURL + '/' + params.positionId;
        return axiosClient.put(url, params);
    },

    delete: (positionId: number): Promise<IResponse> => {
        const url = apiURL + '/' + positionId;
        return axiosClient.delete(url);
    }
};

export default positionService;
