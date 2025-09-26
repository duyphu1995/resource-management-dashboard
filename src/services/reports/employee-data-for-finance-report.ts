import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IEmployeeDataForFinance, IRequestTableParams } from '@/types/reports/employee-data-for-finance';
import { IEmployeeUnit } from '@/types/hr-management/employee-management';

const reportURL = 'report/employee-data-for-finance';
const unitURL = 'unit';

const employeeDataForFinanceReportServices = {
    getReportList: (params: IRequestTableParams): Promise<IResponse<IEmployeeDataForFinance[]>> => {
        return axiosClient.post(reportURL, params);
    },

    exportEmployeeDataForFinanceReport: (params: IRequestTableParams) => {
        const url = reportURL + '/export';
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    getUnitSelectedFinance: (): Promise<IResponse<IEmployeeUnit[]>> => {
        const url = unitURL + '/finance-unit/getall';
        return axiosClient.get(url);
    },

    updateUnitSelectedFinance: (params: number[]): Promise<IResponse> => {
        const url = unitURL + '/finance-unit/bulkupdate';
        return axiosClient.put(url, params);
    }
};

export default employeeDataForFinanceReportServices;
