import { IResponse } from '@/types/common';
import {
    IEmployeeBySomething,
    IGraduatedSummary,
    IParamsList,
    IPositionSummary,
    IReportListForAll,
    ITabEmployeeSummary,
    ITmaSolutionsSummary,
    IUnitSummary
} from '@/types/reports/employee-summary';
import axiosClient from '../axios-client';

const apiURL = 'report/employee-summary';

const buildQuery = (params: Record<string, any>) =>
    Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

const employeeSummaryService = {
    getGenderList: (params: IParamsList, moduleName: string): Promise<IResponse<ITabEmployeeSummary[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/employee-gender?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getEmployeeByGenderList: (params: IParamsList, moduleName: string): Promise<IResponse<IEmployeeBySomething[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId, genderId: params.genderId });

        const url = `${apiURL}/employee-gender/get-employee-by-gender?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getPositionList: (params: IParamsList, moduleName: string): Promise<IResponse<IPositionSummary[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/employee-position?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getEmployeeByPositionList: (params: IParamsList, moduleName: string): Promise<IResponse<IEmployeeBySomething[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId, positionId: params.positionId });

        const url = `${apiURL}/employee-position/get-employee-by-position?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getGraduatedListByDG: (params: IParamsList, moduleName: string): Promise<IResponse<IGraduatedSummary[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/employee-education-by-dg?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getGraduatedListByDC: (params: IParamsList, moduleName: string): Promise<IResponse<IGraduatedSummary[]>> => {
        const query = buildQuery({ unitId: params.unitId, tabType: params.tabType, companyId: params.companyId });
        const url = `${apiURL}/employee-education-by-dc?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getTmaSummaryList: (params: IParamsList, moduleName: string): Promise<IResponse<ITmaSolutionsSummary[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/tma-solution-summary?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getUnitSummaryList: (params: IParamsList, moduleName: string): Promise<IResponse<IUnitSummary[]>> => {
        const query = buildQuery({
            tabType: params.tabType,
            companyId: params.companyId,
            customOrgChartReportStructureId: params.customOrgChartReportStructureId
        });

        const url = `${apiURL}/unit-summary?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getEmployeeByUnit: (params: IParamsList, moduleName: string): Promise<IResponse<IReportListForAll[]>> => {
        const query = buildQuery({
            tabType: params.tabType,
            companyId: params.companyId,
            unitId: params.unitId
        });

        const url = `${apiURL}/get-employee-by-unit?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    getDCSummaryList: (params: IParamsList, moduleName: string): Promise<IResponse<IUnitSummary[]>> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/dc-summary?${query}`;
        return axiosClient.get(url, { moduleName });
    },

    exportEmployeeByUnit: (params: IParamsList, moduleName: string): Promise<IResponse> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId, isEffort: params.isEffort, unitId: params.unitId });

        const url = `${apiURL}/get-employee-by-unit/export?${query}`;
        return axiosClient.post(url, params, { responseType: 'blob', moduleName });
    },

    exportAllEmployeesSummary: (params: IParamsList, moduleName: string): Promise<IResponse> => {
        const query = buildQuery({ tabType: params.tabType, companyId: params.companyId });

        const url = `${apiURL}/export-excel?${query}`;
        return axiosClient.post(url, params, { responseType: 'blob', moduleName });
    }
};

export default employeeSummaryService;
