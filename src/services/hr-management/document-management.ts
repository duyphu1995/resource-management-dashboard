import { IResponse, ITabUpdateHistory } from '@/types/common';
import {
    IDocumentAllIndexes,
    IDocumentAllTypes,
    IDocumentExport,
    IDocumentList,
    IDocumentType,
    IReminderEmail
} from '@/types/hr-management/document-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/document';
const apiQuickFilter = '/quickFilter';
const apiDocumentType = '/documentType';

const documentService = {
    // Get Document
    getAllDocuments: (params: any): Promise<IResponse> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },
    getAllIndexes: (): Promise<IResponse<IDocumentAllIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },
    getAllDocumentTypes: (): Promise<IResponse<IDocumentAllTypes[]>> => {
        const url = apiDocumentType + '/getAll';
        return axiosClient.get(url);
    },
    getDocumentDetail: (id: string): Promise<IResponse<IDocumentList>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    // Export documents
    exportDocuments: (params: IDocumentExport): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Update Document detail
    updateDocumentDetail: (params: IDocumentType[]): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.put(url, params);
    },

    // Get quick filter document
    getAllQuickFilter(): Promise<IResponse<IQuickFilterData[]>> {
        const url = apiURL + apiQuickFilter + '/getAll';
        return axiosClient.get(url);
    },

    updateQuickFilter(params: IQuickFilterData): Promise<IResponse> {
        const url = apiURL + apiQuickFilter + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },

    createQuickFilter(params: IQuickFilterData): Promise<IResponse> {
        const url = apiURL + apiQuickFilter;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter(id: number): Promise<IResponse> {
        const url = apiURL + apiQuickFilter + '/' + id;
        return axiosClient.delete(url);
    },

    // Reminder email document
    reminderEmail(params: IReminderEmail): Promise<IResponse> {
        const url = apiURL + '/sendRemind';
        return axiosClient.post(url, params);
    },
    // Update history document
    getUpdateHistory(id: number): Promise<IResponse<ITabUpdateHistory[]>> {
        const url = apiURL + `/${id}` + '/updateHistory';
        return axiosClient.get(url);
    }
};

export default documentService;
