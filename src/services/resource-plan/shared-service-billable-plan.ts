import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import {
    IAddNewSharedServiceBillablePlan,
    ISharedServiceBillableAllIndex,
    ISharedServiceBillablePlan,
    ISharedServiceBillableUpdate
} from '@/types/resource-plan/shared-service-billable-plan/shared-service-billable-plan';

const apiURL = '/resourceplan/shared-service-billable-plan';
const apiUnitURL = '/unit';

const sharedServiceBillablePlanServices = {
    getTableData: (id: number): Promise<IResponse<ISharedServiceBillablePlan[]>> => {
        const url = `${apiURL}/${id}`;
        return axiosClient.get(url);
    },

    updateSharedServiceBillableDetails: (id: number, params: ISharedServiceBillableUpdate): Promise<IResponse<ISharedServiceBillableUpdate[]>> => {
        const url = `${apiURL}/report/${id}`;
        return axiosClient.put(url, params);
    },

    getSharedServiceBillableDetails: (id: number): Promise<IResponse<ISharedServiceBillableUpdate>> => {
        const url = `${apiURL}/report/${id}`;
        return axiosClient.get(url);
    },

    deleteProject: (id: number): Promise<IResponse> => {
        const url = `${apiURL}/report/${id}`;
        return axiosClient.delete(url);
    },

    getAllIndexes: (): Promise<IResponse<ISharedServiceBillableAllIndex>> => {
        const url = `${apiURL}/allindex`;
        return axiosClient.get(url);
    },

    addNewSharedServiceBillablePlan: (params: IAddNewSharedServiceBillablePlan): Promise<IResponse> => {
        const url = `${apiURL}/report`;
        return axiosClient.post(url, params);
    },

    getAllProject: (unitId?: number): Promise<IResponse<any[]>> => {
        const url = `${apiUnitURL}/get-all-project`;
        return axiosClient.get(url, { params: { unitId } });
    }
};

export default sharedServiceBillablePlanServices;
