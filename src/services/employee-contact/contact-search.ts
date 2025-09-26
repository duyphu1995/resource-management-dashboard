import { IResponse } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';
import { IContactSearchDetail } from '@/types/employee-contact/contact-search';

const apiURL = '/employeeContact';
const apiQuickFilter = apiURL + '/quickFilter';

const contactSearchService = {
    search: (params: any): Promise<IResponse<IEmployee[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getDetail: (employeeId: number): Promise<IResponse<IContactSearchDetail>> => {
        const url = apiURL + '/' + employeeId;
        return axiosClient.get(url);
    },

    favorite: (employeeId: number): Promise<IResponse> => {
        const url = apiURL + '/' + employeeId + '/favorite';
        return axiosClient.put(url);
    },

    getResume: (employeeId: number): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/' + employeeId + '/resume';
        return axiosClient.get(url);
    },
    getSortDetail: (employeeId: number): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/short-detail/' + employeeId;
        return axiosClient.get(url);
    },

    // Quick filter
    getAllQuickFilter: (): Promise<IResponse<IQuickFilterData[]>> => {
        const url = apiQuickFilter + '/getAll';
        return axiosClient.get(url);
    },

    updateQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiQuickFilter + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },

    createQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiQuickFilter;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter: (id: number): Promise<IResponse> => {
        const url = apiQuickFilter + '/' + id;
        return axiosClient.delete(url);
    }
};

export default contactSearchService;
