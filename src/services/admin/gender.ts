import { IAdminGender } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/gender';

const genderService = {
    getAll: (moduleName?: string): Promise<IResponse<IAdminGender[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url, { moduleName });
    }
};

export default genderService;
