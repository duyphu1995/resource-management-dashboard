import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { ISpanControlList, ISpanOfControlReport } from '@/types/reports/span-of-control-report';

const apiURL = '/report/spans-of-control-report';

export enum ReportType {
    Delivery = 1,
    Department = 5
}

const spanOfControlReport = {
    getData: (reportType: ReportType): Promise<IResponse<ISpanOfControlReport[]>> => {
        return axiosClient.get(`${apiURL}?unitTypeId=${reportType}`);
    },
    getSpanOfControlList: (searchParams: any): Promise<IResponse<ISpanControlList[]>> => {
        return axiosClient.post(`${apiURL}/list`, searchParams);
    },
    export: (searchParams: any): Promise<BlobPart> => {
        const url = `${apiURL}/export`;
        return axiosClient({
            url: url,
            method: 'POST',
            responseType: 'blob',
            data: searchParams
        });
    }
};

export default spanOfControlReport;
