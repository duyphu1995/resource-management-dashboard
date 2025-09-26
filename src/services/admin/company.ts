import { ICompany } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/company';

const companyService = {
    getAll: (): Promise<IResponse<ICompany[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url);
    },

    getDetail: (companyId: string): Promise<IResponse<ICompany>> => {
        const url = apiURL + '/' + companyId;
        return axiosClient.get(url);
    },

    add: (params: ICompany): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: ICompany): Promise<IResponse> => {
        const url = apiURL + '/' + params.companyId;
        return axiosClient.put(url, params);
    },

    delete: (companyId: number): Promise<IResponse> => {
        const url = apiURL + '/' + companyId;
        return axiosClient.delete(url);
    }
};

export default companyService;
