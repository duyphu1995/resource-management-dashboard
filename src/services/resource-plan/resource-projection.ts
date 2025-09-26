import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import {
    IConfigurationData,
    IConfigurationUpdate,
    IFormatResourceProjection,
    IResourceProjectionChart,
    IResourceProjectionConfig,
    IResourceProjectionInformation,
    IResourceProjectionNotes
} from '@/types/resource-plan/resource-projection/resource-projection';

const apiURL = '/resourceplan';

const resourceProjectionServices = {
    getTableDataByUnit: (unitId: string): Promise<IResponse<IResourceProjectionInformation>> => {
        const url = `${apiURL}/resource-projection?UnitId=${unitId}`;
        return axiosClient.get(url);
    },
    getChartDataByUnit: (unitId: string, year: number): Promise<IResponse<IResourceProjectionChart[]>> => {
        const url = `${apiURL}/resource-projection/chart-data?unitId=${unitId}&year=${year}`;
        return axiosClient.get(url);
    },
    getConfigurationData: (year: string): Promise<IResponse<IConfigurationData>> => {
        const url = `${apiURL}/resource-projection/config?year=${year}`;
        return axiosClient.get(url);
    },
    updateResourceProjectionConfig(params: IConfigurationUpdate): Promise<IResponse<IResourceProjectionConfig[]>> {
        const url = `${apiURL}/resource-projection/config`;
        return axiosClient.put(url, params);
    },
    updateResourceProjection(unitId: number, params: IFormatResourceProjection[]): Promise<IResponse<IFormatResourceProjection[]>> {
        const url = `${apiURL}/resource-projection/${unitId}`;
        return axiosClient.put(url, params);
    },
    getAllResourceProjectionNote: (unitId: string): Promise<IResponse<IResourceProjectionNotes[]>> => {
        const url = `${apiURL}/resource-projection/${unitId}/notes`;
        return axiosClient.get(url);
    }
};

export default resourceProjectionServices;
