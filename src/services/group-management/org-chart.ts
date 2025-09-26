import { IResponse } from '@/types/common';
import {
    FlatNode,
    IEmployeeEditEffort,
    IEmployeeUnits,
    IExportReportGroup,
    IUpdateOrgChart,
    TreeNode
} from '../../types/group-management/group-management';
import axiosClient from '../axios-client';

const apiURL = '/organizationChart';

const chartService = {
    getOrgChart(id: number) {
        const url = apiURL + `/getByUnit/${id}`;
        return axiosClient.get(url);
    },

    addOrgChart(params: TreeNode): Promise<IResponse> {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    updateOrgChart(params: IUpdateOrgChart): Promise<IResponse> {
        const url = apiURL + `/${params.organizationChartId}`;
        return axiosClient.put(url, params);
    },

    deleteOrgChart(id: number): Promise<IResponse> {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url);
    },

    dragAndDropChart(params: FlatNode[]): Promise<IResponse<FlatNode[]>> {
        const url = apiURL + '/structure';
        return axiosClient.put(url, params);
    },

    // Update employee unit
    updateEmployeeUnit(params: IEmployeeUnits[]): Promise<IResponse<IEmployeeUnits[]>> {
        const url = '/employeeUnit/bulkUpdate';
        return axiosClient.put(url, params);
    },

    // Get list edit project employee unit
    getListEmployeeUnit(id: number): Promise<IResponse<IEmployeeEditEffort[]>> {
        const url = `/employeeUnit/${id}/workingProject`;
        return axiosClient.get(url);
    },

    // Update effort employee list
    updateEffortEmployeeList(id: number, params: any): Promise<IResponse<any[]>> {
        const url = `/employeeUnit/${id}/bulkUpdateEffort`;
        return axiosClient.put(url, params);
    },

    // Remove employee
    removeEmployee(id: number): Promise<IResponse> {
        const url = `/employeeUnit/${id}/leave`;
        return axiosClient.put(url);
    },

    openReportList(params: { id?: string; filterBy?: string; excludeContractor?: boolean }, moduleName?: string): Promise<IResponse> {
        const queryParams: [string, string][] = [];

        if (params.id !== undefined) {
            queryParams.push(['id', params.id]);
        }
        if (params.filterBy !== undefined) {
            queryParams.push(['filterBy', params.filterBy]);
        }
        if (params.excludeContractor !== undefined) {
            queryParams.push(['excludeContractor', params.excludeContractor.toString()]);
        }
        const queryString = new URLSearchParams(queryParams).toString();

        const url = `/employeeUnit/get-employee-report-by-unit${queryString ? `?${queryString}` : ''}`;
        return axiosClient.get(url, { moduleName });
    },

    exportReportGroup: (params: IExportReportGroup, moduleName?: string): Promise<IResponse> => {
        const url = `/employeeUnit/get-employee-report-by-unit/export`;
        return axiosClient.post(url, params, { responseType: 'blob', moduleName });
    }
};

export default chartService;
