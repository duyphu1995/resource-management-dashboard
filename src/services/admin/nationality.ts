import { IAdminNationality } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/nationality';

const nationalityService = {
    getAll: (moduleName: string = 'EmployeeManagement'): Promise<IResponse<IAdminNationality[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    },

    getDetail: (nationalityId: string): Promise<IResponse<IAdminNationality>> => {
        const url = apiURL + '/' + nationalityId;
        return axiosClient.get(url);
    },

    add: (params: IAdminNationality): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    update: (params: IAdminNationality): Promise<IResponse> => {
        const url = apiURL + '/' + params.nationalityId;
        return axiosClient.put(url, params);
    },

    delete: (nationalityId: number): Promise<IResponse> => {
        const url = apiURL + '/' + nationalityId;
        return axiosClient.delete(url);
    }
};

export default nationalityService;
