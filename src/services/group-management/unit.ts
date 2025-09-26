import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';
import { IStructureNode, IUnit, IUnitIndex, IUnitNode } from '@/types/group-management/group-management';
import { IUnitHistoryInfo } from '@/types/group-management/unit-history-info';

const apiURL = '/unit';

const UnitService = {
    // Get All index
    getAllIndex(): Promise<IResponse<IUnitIndex>> {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    //Get Structure Tree
    getStructureTree(): Promise<IResponse<IStructureNode[]>> {
        const url = apiURL + '/getAll';
        return axiosClient.get(url);
    },

    //Get Unit by Id
    getUnitById(id: number): Promise<IResponse<IUnitNode>> {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    // Get head data
    getReportByLastWeek(id: number): Promise<IResponse<IUnitNode>> {
        const url = apiURL + `/${id}/ReportByLastWeek`;
        return axiosClient.get(url);
    },

    // Request to delete
    requestToDelete(id: number, params: { criteria1: boolean; criteria2: boolean; criteria3: boolean }): Promise<IResponse> {
        const url = apiURL + `/${id}/requestToDelete`;
        return axiosClient.post(url, params);
    },

    // Update baseline report
    updateBaselineReport(): Promise<IResponse> {
        const url = apiURL + '/CalculateReport';
        return axiosClient.put(url);
    },

    // Create Unit
    createUnit(data: IUnit): Promise<IResponse<IUnit>> {
        return axiosClient.post(apiURL, data);
    },

    // Update Unit
    updateUnit(data: IUnit): Promise<IResponse<IUnit>> {
        const url = apiURL + `/${data.unitId}`;
        return axiosClient.put(url, data);
    },

    //Delete Unit
    deleteUnit(id: number): Promise<IResponse> {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url);
    },

    // Search unit history info
    searchUnitHistoryInfo(data: any): Promise<IResponse<IUnitHistoryInfo[]>> {
        const url = apiURL + '/HistorySearch';
        return axiosClient.post(url, data);
    },

    // Get detail for popup information user
    getInfoDetailUser: (id: number): Promise<IResponse<any>> => {
        const url = `employeeUnit/information/${id}`;
        return axiosClient.get(url);
    },
    // Get Unit Information
    getUnitInformation: (id: number): Promise<IResponse<any>> => {
        const url = `/unit/${id}/unit-information`;
        return axiosClient.get(url);
    },
    // Get Unit Data
    getUnitData: (id: number): Promise<IResponse<any>> => {
        const url = `/unit/${id}/unit-data`;
        return axiosClient.get(url);
    },

    getByManaged: (moduleName: string): Promise<IResponse<any>> => {
        const url = `${apiURL}/get-by-managed`;
        return axiosClient.get(url, { moduleName });
    }
};

export default UnitService;
