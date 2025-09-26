import { IAdminMarket } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/marketplace';

const nationalityService = {
    getAll: (): Promise<IResponse<IAdminMarket[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url);
    },

    getDetail: (marketplaceId: string): Promise<IResponse<IAdminMarket>> => {
        const url = apiURL + '/' + marketplaceId;
        return axiosClient.get(url);
    },

    add: (params: IAdminMarket): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminMarket): Promise<IResponse> => {
        const url = apiURL + '/' + params.marketplaceId;
        return axiosClient.put(url, params);
    },

    delete: (marketplaceId: number): Promise<IResponse> => {
        const url = apiURL + '/' + marketplaceId;
        return axiosClient.delete(url);
    }
};

export default nationalityService;
