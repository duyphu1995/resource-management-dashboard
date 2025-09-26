import { IResponse, ITabUpdateHistory } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { ITemporaryDetail, ITemporaryExport, ITemporaryIndex } from '@/types/hr-management/temporary-leaves';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/temporaryLeave';
const apiQuickFilter = '/quickFilter';

const temporaryLeaveService = {
    // Search temporary leaves
    searchTemporary: (params: any): Promise<IResponse> => {
        const url = `${apiURL}/search`;
        return axiosClient.post(url, params);
    },

    // Get all index
    getAllIndexes: (): Promise<IResponse<ITemporaryIndex>> => {
        const url = `${apiURL}/allIndex`;
        return axiosClient.get(url);
    },

    // Get temporary leave detail
    getTemporaryDetail: (id: number): Promise<IResponse<ITemporaryDetail>> => {
        const url = `${apiURL}/${id}`;
        return axiosClient.get(url);
    },

    getUpdateHistory: (id: number): Promise<IResponse<ITabUpdateHistory[]>> => {
        const url = apiURL + `/${id}/updateHistory`;
        return axiosClient.get(url);
    },

    // Get employee infor
    getEmployeeInformation: (searchText: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/employeeInformation?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },

    // Export Temporary leave
    exportTemporaryLeave: (params: ITemporaryExport): Promise<IResponse<ITemporaryExport>> => {
        const url = apiURL + '/export';
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Add new temporary leave
    addTemporaryLeave: (params: ITemporaryDetail): Promise<IResponse<ITemporaryDetail>> => {
        const url = apiURL + '';
        return axiosClient.post(url, params);
    },

    // Update temporary leave
    updateTemporaryLeave: (id: number, params: ITemporaryDetail): Promise<IResponse<ITemporaryDetail>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.put(url, params);
    },

    // Delete temporary leave
    deleteTemporaryLeave: (id: number): Promise<IResponse> => {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url);
    },

    // Export temporary leaves
    exportTemporaryLeaves: (params: any): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params);
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

export default temporaryLeaveService;
