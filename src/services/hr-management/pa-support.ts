import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IPASupport } from '@/types/hr-management/pa-support';

const apiURL = '/pasupport';

const paSupportService = {
    getList: (): Promise<IResponse<IPASupport[]>> => {
        const url = apiURL + '/mismatch';
        return axiosClient.get(url);
    },

    updateData: (): Promise<IResponse> => {
        const url = apiURL + '/update';
        return axiosClient.put(url);
    }
};

export default paSupportService;
