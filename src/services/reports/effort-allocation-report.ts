import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IPayloadExport, IEffortAllocationTable } from '@/types/reports/effort-allocation';

const reportUrl = 'report/effort-location';

interface IEffortLocationParams {
    filterBy: string;
    sortedBy: string;
}

const effortAllocationReportServices = {
    getEffortLocation: (params: IEffortLocationParams): Promise<IResponse<IEffortAllocationTable[]>> => {
        const url = reportUrl;
        return axiosClient.get(url, { params });
    },

    exportEffortLocation: (params: IPayloadExport) => {
        const url = reportUrl + '/export';

        const queryString = new URLSearchParams(Object.fromEntries(Object.entries(params))).toString();

        return axiosClient({
            url: url + '?' + queryString,
            method: 'POST',
            responseType: 'blob'
        });
    }
};

export default effortAllocationReportServices;
