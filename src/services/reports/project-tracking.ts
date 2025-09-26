import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IBillableTracking, IBillableTrackingList, IProjectTracking, IProjectTrackingList } from '@/types/reports/project-tracking';

const apiURL = '/report';

const projectTrackingService = {
    getProjectTrackingList: (params: IProjectTracking): Promise<IResponse<IProjectTrackingList[]>> => {
        const url = apiURL + '/projectTracking';
        return axiosClient.post(url, params);
    },

    getBillableTrackingList: (params: IBillableTracking): Promise<IResponse<IBillableTrackingList>> => {
        const url = apiURL + `/billableTracking?year=${params.year}&week=${params.week}&isShowAll=${params.isShowAll}`;
        return axiosClient.get(url);
    },

    exportProjectTracking: (params: any): Promise<IResponse> => {
        const url = apiURL + `/projectTracking/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    exportBillableTracking: (params: IBillableTracking): Promise<IResponse> => {
        const url = apiURL + `/billableTracking/export?year=${params.year}&week=${params.week}&isShowAll=${params.isShowAll}`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    }
};

export default projectTrackingService;
