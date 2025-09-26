import { IAdminEntryLanguage } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/entryLanguage';

const entryLanguageService = {
    getAll: (moduleName?: string): Promise<IResponse<IAdminEntryLanguage[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    getDetail: (id: string): Promise<IResponse<IAdminEntryLanguage>> => {
        const url = apiURL + '/' + id;
        return axiosClient.get(url);
    },

    add: (params: IAdminEntryLanguage): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminEntryLanguage): Promise<IResponse> => {
        const url = apiURL + '/' + params.entryLanguageId;
        return axiosClient.put(url, params);
    },

    delete: (id: number): Promise<IResponse> => {
        const url = apiURL + '/' + id;
        return axiosClient.delete(url);
    }
};

export default entryLanguageService;
