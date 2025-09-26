import { IAdminEmailSubscription } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/emailSubscription';

const emailSubscriptionService = {
    getAll: (): Promise<IResponse<IAdminEmailSubscription[]>> => {
        const url = apiURL + '/getall';
        return axiosClient.get(url);
    },

    getById: (id: number): Promise<IResponse<IAdminEmailSubscription>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    addEmailSubscription: (data: IAdminEmailSubscription): Promise<IResponse<IAdminEmailSubscription>> => {
        const url = apiURL;
        return axiosClient.post(url, data);
    },

    updateEmailSubscription: (data: IAdminEmailSubscription): Promise<IResponse<IAdminEmailSubscription>> => {
        const url = apiURL + `/${data.emailSubscriptionId}`;
        return axiosClient.put(url, data);
    }
};

export default emailSubscriptionService;
