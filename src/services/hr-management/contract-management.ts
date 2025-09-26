import { IResponse } from '@/types/common';
import {
    IContract,
    IContractAddEditIndexes,
    IContractEdit,
    IContractExport,
    IContractIndexes,
    IContractSalary
} from '@/types/hr-management/contract-management';
import { IEmployee } from '@/types/hr-management/employee-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/contract';
const apiQuickFilter = '/quickFilter';

const contractService = {
    getAllIndexes: (): Promise<IResponse<IContractIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    searchContract: (params: any, signal?: AbortSignal): Promise<IResponse<IContract[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params, { signal });
    },

    getContractDetail: (id: string, moduleName: string = 'TemporaryLeavesDetails'): Promise<IResponse<IContract>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url, { moduleName });
    },

    getByDateRange: (employeeId = 0, fromDate = '', toDate = ''): Promise<IResponse<IContract>> => {
        const url = `${apiURL}/getByDateRange?employeeId=${employeeId}&fromDate=${fromDate}&toDate=${toDate}`;
        return axiosClient.get(url);
    },

    // Get all index for add and update contract
    getIndexesForAddAndEdit: (): Promise<IResponse<IContractAddEditIndexes>> => {
        const url = apiURL + '/contractIndexForAddNew';
        return axiosClient.get(url);
    },

    // Get employee infor
    getEmployeeInformation: (searchText: string): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/employeeInformation?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },

    // Get salary
    getContractSalaryInfor: (employeeId: number, companyId: number, isNonTechnicalValue: boolean): Promise<IResponse<IContractSalary>> => {
        const url = apiURL + `/contractSalaryInfor/employee/${employeeId}/company/${companyId}/isNonTechnical/${isNonTechnicalValue}`;
        return axiosClient.get(url);
    },

    // Export contracts
    exportContracts: (params: IContractExport): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Add contract
    addNewContract: (params: IContractEdit): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    // Update contract
    updateContract: (params: IContractEdit): Promise<IResponse> => {
        const { contractId } = params;
        const url = apiURL + '/' + contractId;

        return axiosClient.put(url, params);
    },

    // Delete contract
    deleteContract: (id: number): Promise<IResponse> => {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url);
    },

    // Restore contract
    restoreContract: (id: number): Promise<IResponse> => {
        const url = apiURL + `/${id}/restore`;
        return axiosClient.put(url);
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

export default contractService;
