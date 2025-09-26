import { IResponse } from '@/types/common';
import { IEmployeeExport } from '@/types/hr-management/employee-management';
import { IQuickFilterData } from '@/types/quick-filter';
import { IEmployeeInfo, IMailList, IRoleName, ITransferEmployee, ITransferIndex } from '@/types/transfer-employee';
import axiosClient from '../axios-client';

const apiURL = '/employeeTransfer';
const apiQuickFilter = '/quickFilter';

const employeeTransferService = {
    // Get all employee transfer
    getAllEmployeeTransfer: (params: ITransferEmployee): Promise<IResponse<ITransferEmployee[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getAllIndex: (): Promise<IResponse<ITransferIndex>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },
    getEmployeeMailList: (params: string | undefined): Promise<IResponse<IMailList>> => {
        const url = apiURL + `/employeeMaillist?employeeWorkEmail=${params}`;
        return axiosClient.get(url);
    },
    getEmployeeInformation: (params: any): Promise<IResponse<IEmployeeInfo[]>> => {
        const url = `${apiURL}/employeeInformation?searchText=${params}`;
        return axiosClient.get(url);
    },

    getRoleName: (): Promise<IResponse<IRoleName>> => {
        const url = `${apiURL}/selfInformation`;
        return axiosClient.get(url);
    },

    createNewTransfer: (params: ITransferEmployee): Promise<IResponse> => {
        const url = `${apiURL}/create`;
        return axiosClient.post(url, params);
    },
    updateTransfer: (params: ITransferEmployee, moduleName: string = 'EmployeeTransfer'): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.put(url, params, { moduleName });
    },

    // Get detail employee transfer
    getEmployeeTransferDetail: (id: string): Promise<IResponse<ITransferEmployee>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
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

    // Export employees
    exportEmployeeTransfer: (params: IEmployeeExport): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    checkTargetProject: (id: number): Promise<IResponse> => {
        const url = `${apiURL}/projects/${id}/manager-info`;
        return axiosClient.get(url);
    }
};

export default employeeTransferService;
