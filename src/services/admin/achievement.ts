import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IAchievement } from '@/types/hr-management/employee-management';

const apiURL = '/achievement';

const achievementService = {
    // Add new achievement
    addAchievement: (params: IAchievement, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params, { moduleName });
    },
    // Update achievement
    updateAchievement: (params: IAchievement, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiURL + `/${params.achievementId}`;
        return axiosClient.put(url, params, { moduleName });
    },
    // Delete achievement
    deleteAchievement: (id: number, moduleName: string = 'EmployeeManagement'): Promise<IResponse> => {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url, { moduleName });
    }
};

export default achievementService;
