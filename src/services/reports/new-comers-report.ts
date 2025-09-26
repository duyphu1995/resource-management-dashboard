import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { INewComersReportsInformation } from '@/types/reports/new-comers-report';

const apiURL = '/report/newcomers';

const newComersReportServices = {
    getTableData: (joinDate: string): Promise<IResponse<INewComersReportsInformation[]>> => {
        const url = `${apiURL}?joinDate=${joinDate}`;
        return axiosClient.get(url);
    },
    exportExcel: (joinDate: string): Promise<BlobPart> => {
        const url = `${apiURL}/export?joinDate=${joinDate}`;
        return axiosClient({
            url: url,
            method: 'POST',
            responseType: 'blob'
        });
    },
};

export default newComersReportServices;
