import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { ISharedServiceSummaryTable, ISharedServiceDetailsTable, IHeadcountData } from '@/types/reports/headcount-report';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';

const reportURL = 'report/headcount';
const unitURL = 'unit';

const headcountReportServices = {
    getHeadcountData: (unitTypeLevel: number, moduleName?: string): Promise<IResponse<IHeadcountData[]>> => {
        const url = `${reportURL}`;
        return axiosClient.get(url, { params: { unitTypeLevel }, moduleName });
    },

    getSharedServiceSummary: (): Promise<IResponse<ISharedServiceSummaryTable[]>> => {
        const url = `${reportURL}/shared-service-summary`;
        return axiosClient.get(url);
    },

    getUnitsSelectedSharedServicesSummary: (): Promise<IResponse<IEmployeeUnit[]>> => {
        const url = `${unitURL}/sharedservice/getall`;
        return axiosClient.get(url);
    },

    updateUnitsSelectedSharedServices: (payload: number[] | undefined): Promise<IResponse<any>> => {
        const url = `${unitURL}/sharedservice/bulkupdate`;
        return axiosClient.put(url, payload);
    },

    getSharedServiceDetails: (params: any): Promise<IResponse<ISharedServiceDetailsTable[]>> => {
        const url = `${reportURL}/shared-service-detail`;
        return axiosClient.get(url, { params });
    }
};

export default headcountReportServices;
