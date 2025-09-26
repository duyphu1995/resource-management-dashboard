import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IMaritalStatus } from '@/types/hr-management/employee-management';

const apiURL = '/martialStatus';

const maritalStatusService = {
    getAll: (): Promise<IResponse<IMaritalStatus[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url);
    }
};

export default maritalStatusService;
