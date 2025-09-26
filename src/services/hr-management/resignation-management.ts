import { IResponse } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import {
    IResignation,
    IResignationAdd,
    IResignationEdit,
    IResignationExport,
    IResignationIndexes,
    IResignationMoreInformation,
    IResignationUpdatedHistory
} from '@/types/hr-management/resignation-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';
const apiURL = '/resignationForm';
const quickFilterApiURL = '/quickFilter';

const resignationService = {
    search: (params: any, signal?: AbortSignal): Promise<IResponse<IResignation[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params, { signal });
    },

    // Get all index
    getAllIndexes: (): Promise<IResponse<IResignationIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    // Get employee info
    getEmployeeInformation: (searchText: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/employeeInformation?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },

    // Get detail
    getDetail: (employeeId: string = ''): Promise<IResponse<IResignation>> => {
        const url = apiURL + '/' + employeeId;
        return axiosClient.get(url);
    },

    getMoreInfo: (employeeId: string = ''): Promise<IResponse<IResignationMoreInformation>> => {
        const url = apiURL + '/' + employeeId + '/moreInformation';
        return axiosClient.get(url);
    },

    // Get updated history
    getUpdatedHistory: (id: string = ''): Promise<IResponse<IResignationUpdatedHistory[]>> => {
        const url = apiURL + `/${id}/updateHistory`;
        return axiosClient.get(url);
    },

    // Send mail
    sendMail: (resignationFormId = -1): Promise<IResponse> => {
        const url = `${apiURL}/${resignationFormId}/sendResignedEmail`;
        return axiosClient.post(url);
    },

    // Undo
    undo: (resignationFormId = -1): Promise<IResponse> => {
        const url = `${apiURL}/${resignationFormId}`;
        return axiosClient.delete(url);
    },

    // Add new
    addNewResignation: (resignation: IResignationAdd): Promise<IResponse> => {
        return axiosClient.post(apiURL, resignation);
    },

    // Update
    updateResignation: (resignation: IResignationEdit): Promise<IResponse> => {
        const url = apiURL + '/' + resignation.resignationFormId;
        return axiosClient.put(url, resignation);
    },

    // Export
    export: (params: IResignationExport): Promise<IResponse> => {
        const url = apiURL + '/export';
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Quick filter
    getAllQuickFilter: (): Promise<IResponse<IQuickFilterData[]>> => {
        const url = apiURL + quickFilterApiURL + '/getAll';
        return axiosClient.get(url);
    },
    updateQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + quickFilterApiURL + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },
    createQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + quickFilterApiURL;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter: (id: number): Promise<IResponse> => {
        const url = apiURL + quickFilterApiURL + '/' + id;
        return axiosClient.delete(url);
    }
};

export default resignationService;
