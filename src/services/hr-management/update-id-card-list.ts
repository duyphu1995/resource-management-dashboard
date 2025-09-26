import { IResponse } from '@/types/common';
import { IIdCardIndexes, IUpdateIDCardList } from '@/types/hr-management/update-id-card-list';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/employeeIdCard';
const apiQuickFilter = '/quickFilter';

const updateIdCardListService = {
    // Get all update id card list
    getAllUpdateIdCardList: (params: any): Promise<IResponse> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getAllIndexes: (): Promise<IResponse<IIdCardIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    // Export update id card list
    exportUpdateIdCardList: (params: any): Promise<IResponse> => {
        const url = apiURL + '/export';
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Get all list of update id card
    getAllListUser: (): Promise<IResponse> => {
        const url = apiURL + '/getall';
        return axiosClient.get(url);
    },

    // Create update id card
    createUpdateIdCard: (params: IUpdateIDCardList): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
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
    }
};

export default updateIdCardListService;
