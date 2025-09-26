import { IResponse } from '@/types/common';
import { IContractAddEditIndexes } from '@/types/hr-management/contract-management';
import {
    IContractor,
    IContractorContract,
    IContractorExport,
    IContractorIndexes,
    IContractorStatus,
    IContractorStatusCount,
    IContractorUpdatedHistory,
    IConvertToEmployee
} from '@/types/hr-management/contractor-management';
import { IEducation, IHealthTracking } from '@/types/hr-management/employee-management';
import { IQuickFilterData } from '@/types/quick-filter';
import axiosClient from '../axios-client';

const apiURL = '/contractor';
const apiQuickFilter = '/quickFilter';

const contractorService = {
    searchContractor: (params: any): Promise<IResponse<IContractor[]>> => {
        const url = apiURL + '/search';
        return axiosClient.post(url, params);
    },

    getAllIndexes: (): Promise<IResponse<IContractorIndexes>> => {
        const url = apiURL + '/allIndex';
        return axiosClient.get(url);
    },

    getContractorDetail: (id: string): Promise<IResponse<IContractor>> => {
        const url = apiURL + `/${id}`;
        return axiosClient.get(url);
    },

    getContractorInforCommon: (id: string): Promise<IResponse<IContractor>> => {
        const url = apiURL + `/${id}` + '/common-information';
        return axiosClient.get(url);
    },

    getPersonalInformation: (id: string): Promise<IResponse<IContractor>> => {
        const url = apiURL + `/${id}` + '/personal-information';
        return axiosClient.get(url);
    },

    getHealthTracking: (id: string): Promise<IResponse<IHealthTracking>> => {
        const url = apiURL + `/${id}` + '/health-tracking';
        return axiosClient.get(url);
    },

    getEducations: (id: string): Promise<IResponse<IEducation>> => {
        const url = apiURL + `/${id}` + '/educations';
        return axiosClient.get(url);
    },

    getContracts: (id: string): Promise<IResponse<IEducation>> => {
        const url = apiURL + `/${id}` + '/contracts';
        return axiosClient.get(url);
    },

    getWorkExperiencesBeforeTMA: (id: string): Promise<IResponse<IEducation>> => {
        const url = apiURL + `/${id}` + '/work-experiences-before-tma';
        return axiosClient.get(url);
    },

    getAllContractorStatus: (): Promise<IResponse<IContractorStatus[]>> => {
        const url = `${apiURL}/contractorStatus/getAll`;
        return axiosClient.get(url);
    },

    getContractorStatusCount: (): Promise<IResponse<IContractorStatusCount>> => {
        const url = `${apiURL}/contractorStatus/count`;
        return axiosClient.get(url);
    },

    // Update contractor work information
    updateContractorWorkInformation: (params: IContractor): Promise<IResponse> => {
        const url = apiURL + `/${params.contractorId}/workInformation`;
        return axiosClient.put(url, params);
    },
    // Update contractor personal information
    updateContractorPersonalInformation: (params: IContractor): Promise<IResponse> => {
        const url = apiURL + `/${params.contractorId}/information`;
        return axiosClient.put(url, params);
    },

    // Get updated history
    getUpdatedHistory: (id: string = ''): Promise<IResponse<IContractorUpdatedHistory[]>> => {
        const url = apiURL + `/${id}/updateHistory`;
        return axiosClient.get(url);
    },
    // Get position
    getPositions: (): Promise<IResponse<any[]>> => {
        const url = apiURL + '/position/getAll';
        return axiosClient.get(url);
    },

    // Export contractors
    exportContractors: (params: IContractorExport): Promise<IResponse> => {
        const url = `${apiURL}/export`;
        return axiosClient.post(url, params, { responseType: 'blob' });
    },

    // Delete contractor
    deleteContractor: (id: number): Promise<IResponse> => {
        const url = apiURL + `/${id}`;
        return axiosClient.delete(url);
    },

    // Quick filter
    getAllQuickFilter: (): Promise<IResponse<IQuickFilterData[]>> => {
        const url = apiURL + apiQuickFilter + '/getAll';
        return axiosClient.get(url);
    },

    updateQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + params.quickFilterId;
        return axiosClient.put(url, params);
    },

    createQuickFilter: (params: IQuickFilterData): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter;
        return axiosClient.post(url, params);
    },

    deleteQuickFilter: (id: number): Promise<IResponse> => {
        const url = apiURL + apiQuickFilter + '/' + id;
        return axiosClient.delete(url);
    },

    // Get Health Tracking Contractor
    getHealthTrackingContractor: (): Promise<IResponse> => {
        const url = apiURL + '/healthTracking/certificate/getAll';
        return axiosClient.get(url);
    },

    // Add Health Tracking Contractor
    addHealthTrackingContractor: (params: IHealthTracking): Promise<IResponse> => {
        const url = apiURL + '/healthTracking';
        return axiosClient.post(url, params);
    },

    // Update Health Tracking Contractor
    updateHealthTrackingContractor: (params: IHealthTracking): Promise<IResponse> => {
        const url = apiURL + `/healthTracking/${params.employeeCertificateId}`;
        return axiosClient.put(url, params);
    },

    // Delete Health Tracking Contractor
    deleteHealthTrackingContractor: (id: number): Promise<IResponse> => {
        const url = apiURL + `/healthTracking/${id}`;
        return axiosClient.delete(url);
    },

    // Get university contractor
    getUniversityContractor: (): Promise<IResponse> => {
        const url = apiURL + '/university/getAll';
        return axiosClient.get(url);
    },

    // Get education ranking contractor
    getEducationRankingContractor: (): Promise<IResponse> => {
        const url = apiURL + '/educationRanking/getAll';
        return axiosClient.get(url);
    },

    // Add education contractor
    addEducationContractor: (params: IEducation): Promise<IResponse> => {
        const url = apiURL + '/education';
        return axiosClient.post(url, params);
    },

    // Update education contractor
    updateEducationContractor: (id: number, params: IEducation): Promise<IResponse> => {
        const url = apiURL + `/education/${id}`;
        return axiosClient.put(url, params);
    },

    // Delete education contractor
    deleteEducationContractor: (id: number): Promise<IResponse> => {
        const url = apiURL + `/education/${id}`;
        return axiosClient.delete(url);
    },

    // Get Contractor Contract Index For Add New
    getContractorContractIndexForAddNew: (): Promise<IResponse<IContractAddEditIndexes>> => {
        const url = apiURL + `/contract/contractIndexForAddNew`;
        return axiosClient.get(url);
    },

    // Get Contractor Contract For Add New By Contractor Id
    getForAddNewByContractorId: (id: string): Promise<IResponse<IContractorContract>> => {
        const url = apiURL + `/${id}/contractInfoForAddNew`;
        return axiosClient.get(url);
    },

    // Get Contractor Contract Detail
    getContractorContractDetail: (id: number): Promise<IResponse<IContractorContract>> => {
        const url = apiURL + `/contract/${id}`;
        return axiosClient.get(url);
    },

    // Get By Date Range
    getByDateRange: (contractorId: number, startDate: string | undefined, endDate: string | undefined): Promise<IResponse> => {
        const url = `${apiURL}/contract/getByDateRange?contractorId=${contractorId}&startDate=${startDate}&endDate=${endDate}`;
        return axiosClient.get(url);
    },

    // Add Contractor Contract
    addContractorContract: (params: IContractorContract): Promise<IResponse> => {
        const url = apiURL + `/contract`;
        return axiosClient.post(url, params);
    },

    // Update Contractor Contract
    updateContractorContract: (id: number, params: IContractorContract): Promise<IResponse> => {
        const url = apiURL + `/contract/${id}`;
        return axiosClient.put(url, params);
    },

    // Delete Contractor Contract
    deleteContractorContract: (id: number): Promise<IResponse> => {
        const url = apiURL + `/contract/${id}`;
        return axiosClient.delete(url);
    },

    // Add working experience before TMA
    addWorkingExperienceBeforeTMA: (params: IContractorContract): Promise<IResponse> => {
        const url = apiURL + `/employment`;
        return axiosClient.post(url, params);
    },

    // Update working experience before TMA
    updateWorkingExperienceBeforeTMA: (id: number, params: IContractorContract): Promise<IResponse> => {
        const url = apiURL + `/employment/${id}`;
        return axiosClient.put(url, params);
    },

    // Delete working experience before TMA
    deleteWorkingExperienceBeforeTMA: (id: number): Promise<IResponse> => {
        const url = apiURL + `/employment/${id}`;
        return axiosClient.delete(url);
    },

    // Convert To Employee
    convertToEmployee: (params: IConvertToEmployee): Promise<IResponse<IConvertToEmployee>> => {
        const url = apiURL + `/convertToEmployee`;
        return axiosClient.post(url, params);
    },

    // End Contractor
    endContractor: (id: number): Promise<IResponse<IContractor>> => {
        const url = apiURL + `/${id}/endContractor`;
        return axiosClient.put(url);
    },

    // Check BadgeId Exist
    checkBadgeIdExist: (badgeId: string): Promise<IResponse<boolean>> => {
        const url = apiURL + `/getByBadgeId/${badgeId}`;
        return axiosClient.get(url);
    },

    // Check Email Exist
    checkEmailExist: (email: string): Promise<IResponse<boolean>> => {
        const url = apiURL + `/getByWorkEmail/${email}`;
        return axiosClient.get(url);
    },

    // Send Email
    sendEmail: (id: number): Promise<IResponse> => {
        const url = apiURL + `/${id}/endContractorEmail`;
        return axiosClient.post(url);
    },

    // Upload File
    uploadFile: (params: any): Promise<IResponse> => {
        const url = apiURL + '/uploadFile';
        return axiosClient.post(url, params, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
};

export default contractorService;
