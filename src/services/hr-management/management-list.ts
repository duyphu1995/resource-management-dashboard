import { IResponse } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/employeeExclude';
const apiQuickFilter = '/quickFilter';

const managementListService = {
    // Get data
    searchManagement: (params: any) => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getEmployeeInformation: (searchText = ''): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/employeeInfoForAddNew?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },

    getDetail: (id: number) => {
        const url = apiURL + '/' + id;
        return axiosClient.get(url);
    },

    // Update
    updateStatus: (employeeId: number, isShow: boolean): Promise<IResponse> => {
        const url = apiURL + '/' + employeeId;
        return axiosClient.put(url, {
            employeeId,
            isShow
        });
    },

    // Add new
    addNewManagement: (employee: IEmployee): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, employee);
    },

    // Delete
    deleteManagement: (id: number): Promise<IResponse> => {
        const url = `${apiURL}/${id}`;
        return axiosClient.delete(url);
    },

    // Quick filter
    getAllQuickFilter: (): Promise<IResponse<IQuickFilterData[]>> => {
        const url = apiURL + apiQuickFilter + '/getAll';
        return axiosClient.get(url);
    },

    updateQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },

    createQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter: (id: number): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + id;
        return axiosClient.delete(url);
    }
};

export default managementListService;
