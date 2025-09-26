import { IAdminSalary } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/salaryRange';

const salaryService = {
    getAll: (): Promise<IResponse<IAdminSalary[]>> => {
        const url = apiURL + '/getall';
        return axiosClient.get(url);
    },

    getById: (id: number): Promise<IResponse<IAdminSalary>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    addSalaryRange: (data: IAdminSalary): Promise<IResponse<IAdminSalary>> => {
        const url = apiURL;
        return axiosClient.post(url, data);
    },

    updateSalaryRange: (data: IAdminSalary): Promise<IResponse<IAdminSalary>> => {
        const url = apiURL + `/${data.salaryRangeId}`;
        return axiosClient.put(url, data);
    }
};

export default salaryService;
