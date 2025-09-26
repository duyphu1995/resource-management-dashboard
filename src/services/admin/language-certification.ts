import { IAdminLanguageCertification, IAdminRanking } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/language';

const languageCertificationService = {
    getListLanguage: (moduleName: string = 'LanguageCertification'): Promise<IResponse<IAdminLanguageCertification[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    getListRanking: (): Promise<IResponse<IAdminLanguageCertification[]>> => {
        const url = apiURL + '/ranking/getAll';
        return axiosClient.get(url);
    },

    getDetailLanguage: (id: string): Promise<IResponse<IAdminLanguageCertification>> => {
        const url = apiURL + '/' + id;
        return axiosClient.get(url);
    },

    addLanguage: (params: IAdminLanguageCertification): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    updateLanguage: (params: IAdminLanguageCertification): Promise<IResponse> => {
        const url = apiURL + '/' + params.languageId;
        return axiosClient.put(url, params);
    },

    deleteLanguage: (id: number | undefined): Promise<IResponse> => {
        const url = apiURL + '/' + id;
        return axiosClient.delete(url);
    },

    getDetailLevel: (id: string): Promise<IResponse<IAdminRanking>> => {
        const url = apiURL + '/ranking/' + id;
        return axiosClient.get(url);
    },

    addLevel: (params: IAdminRanking): Promise<IResponse> => {
        const url = apiURL + '/ranking';
        return axiosClient.post(url, params);
    },

    updateLevel: (params: IAdminRanking): Promise<IResponse> => {
        const url = apiURL + '/ranking/' + params.rankId;
        return axiosClient.put(url, params);
    },

    deleteLevel: (id: number | undefined): Promise<IResponse> => {
        const url = apiURL + '/ranking/' + id;
        return axiosClient.delete(url);
    }
};

export default languageCertificationService;
