import {
    IContractManagement,
    IContractModalTable,
    IFilterDataChildren,
    IProjectContractByType,
    IProjects,
    IValuesProjectContract,
    IValuesProjectContractModal
} from '@/types/reports/project-contract';
import axiosClient from '../axios-client';
import { IResponse } from '@/types/common';

const reportUrl = 'projectcontract';

const projectContractReportServices = {
    getProjectContractByType: (projectType: 'Fixed' | 'ODC', params?: IFilterDataChildren): Promise<IResponse<IProjectContractByType[]>> => {
        const url = `${reportUrl}/project-contract-by-type/search`;
        return axiosClient.post(url, params || {}, { params: { projectType } });
    },

    getProjectByContract: (params?: IFilterDataChildren): Promise<IResponse<IProjects[]>> => {
        const url = `${reportUrl}/project-by-contract/search`;
        return axiosClient.post(url, params || {});
    },

    getProjectContract: (params?: IFilterDataChildren): Promise<IResponse<IContractManagement[]>> => {
        const url = `${reportUrl}/search`;
        return axiosClient.post(url, params || {});
    },

    addProjectContract: (params: IValuesProjectContract): Promise<IResponse> => {
        const url = `${reportUrl}`;
        return axiosClient.post(url, params);
    },

    getProjectByContractModal: (projectContractId?: number): Promise<IResponse<IContractModalTable[]>> => {
        const url = `${reportUrl}/project-by-contract/getall`;
        return axiosClient.get(url, { params: { projectContractId } });
    },

    addProjectByContractModal: (params: IValuesProjectContractModal): Promise<IResponse> => {
        const url = `${reportUrl}/project-by-contract`;
        return axiosClient.post(url, undefined, { params });
    },

    deleteProjectByContractModal: (params: IValuesProjectContractModal): Promise<IResponse> => {
        const url = `${reportUrl}/project-by-contract`;
        return axiosClient.delete(url, { params });
    },

    editProjectByContract: (projectContractInfoId: number | undefined, payload: IValuesProjectContract): Promise<IResponse> => {
        const url = `${reportUrl}/${projectContractInfoId}`;
        return axiosClient.put(url, payload);
    },

    deleteProjectContract: (projectContractInfoId: number): Promise<IResponse> => {
        const url = `${reportUrl}/${projectContractInfoId}`;
        return axiosClient.delete(url);
    }
};

export default projectContractReportServices;
