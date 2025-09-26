import { IResponse } from '@/types/common';
import { IEmployeeProjectionResponse } from '@/types/reports/employee-project';
import axiosClient from '../axios-client';

const apiURL = 'report/employee-project';

const employeeProjectService = {
    getTableData: (): Promise<IResponse<IEmployeeProjectionResponse>> => {
        const url = `${apiURL}`;
        return axiosClient.get(url);
    },
    exportExcel: (): Promise<IResponse> => {
        const url = `${apiURL}/export-excel`;
        return axiosClient.get(url, { responseType: 'blob' });
    },

    exportCSV: (): Promise<IResponse> => {
        const url = `${apiURL}/export-csv`;
        return axiosClient.get(url, { responseType: 'blob' });
    }
};

export default employeeProjectService;
