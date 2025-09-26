import { IResponse, ITabUpdateHistory } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IOnsite, IOnsiteExport, IOnsiteIndexes } from '@/types/hr-management/onsite-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/onsiteForm';
const apiQuickFilter = '/quickFilter';

const onsiteService = {
    searchOnsite: (params: any, signal?: AbortSignal): Promise<IResponse<IOnsite[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params, { signal });
    },
    // Get update history
    getUpdateHistory: (id: number): Promise<IResponse<ITabUpdateHistory[]>> => {
        const url = apiURL + `/${id}/updateHistory`;
        return axiosClient.get(url);
    },
    // Get all index
    getAllIndexes: (): Promise<IResponse<IOnsiteIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },
    // Get employee info
    getEmployeeInformation: (searchText: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/employeeInformation?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },
    // Get Expense
    getExpense: (): Promise<IResponse> => {
        const url = apiURL + '/expenseTemplate/getAll';
        return axiosClient.get(url);
    },
    // Get money unit
    getMoneyUnit: (): Promise<IResponse> => {
        const url = apiURL + '/monetaryUnit/getAll';
        return axiosClient.get(url);
    },
    // Get visa type
    getVisaType: (): Promise<IResponse> => {
        const url = apiURL + '/visaType/getAll';
        return axiosClient.get(url);
    },
    // Get project
    getProject: (id: number): Promise<IResponse> => {
        const url = apiURL + '/project/getByEmployee/' + id;
        return axiosClient.get(url);
    },
    // Get country
    getCountry: (): Promise<IResponse> => {
        const url = '/OnsiteCountry/getAll';
        return axiosClient.get(url);
    },

    // Upload file
    uploadFile: (params: any): Promise<IResponse> => {
        const url = apiURL + '/uploadFile';
        return axiosClient.post(url, params, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Create onsite
    addOnsite: (params: IOnsite): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },
    // Update onsite
    updateOnsite: (id: number, params: IOnsite): Promise<IResponse> => {
        const url = apiURL + '/' + id;
        return axiosClient.put(url, params);
    },
    // Delete onsite
    deleteOnsite: (id: number): Promise<IResponse> => {
        const url = apiURL + '/' + id;
        return axiosClient.delete(url);
    },

    // Get onsite detail
    getOnsiteDetail: (id: number): Promise<IResponse<IOnsite>> => {
        const url = apiURL + '/' + id;
        return axiosClient.get(url);
    },

    // Export onsite
    exportOnsite: (params: IOnsiteExport): Promise<IResponse> => {
        const url = apiURL + '/export';
        return axiosClient.post(url, params, { responseType: 'blob' });
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
    },
    // Get commitment types
    getCommitmentTypes: (): Promise<IResponse> => {
        const url = apiURL + '/commitmentType/getall';
        return axiosClient.get(url);
    }
};

export default onsiteService;
