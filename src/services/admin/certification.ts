import { IAdminCertificationName, IAdminCertificationType } from '@/types/admin';
import { IResponse } from '@/types/common';
import axiosClient from '../axios-client';

const apiURL = '/certificate';

const certificationService = {
    getListCertificateType: (moduleName: string = 'Certification'): Promise<IResponse<IAdminCertificationType[]>> => {
        const url = apiURL + '/getAllCertificateType';
        return axiosClient.get(url, { moduleName });
    },

    getListCertificateName: (): Promise<IResponse<IAdminCertificationName[]>> => {
        const url = apiURL + '/getAll';
        return axiosClient.get(url);
    },

    getDetailCertificateType: (id: string): Promise<IResponse<IAdminCertificationType>> => {
        const url = apiURL + '/certificateType/' + id;
        return axiosClient.get(url);
    },

    addCertificateType: (params: IAdminCertificationType): Promise<IResponse> => {
        const url = apiURL + '/certificateType';
        return axiosClient.post(url, params);
    },

    updateCertificateType: (params: IAdminCertificationType): Promise<IResponse> => {
        const url = apiURL + '/certificateType/' + params.certificateTypeId;
        return axiosClient.put(url, params);
    },

    deleteICertificateType: (id: number | undefined): Promise<IResponse> => {
        const url = apiURL + '/certificateType/' + id;
        return axiosClient.delete(url);
    },

    getDetailCertificateName: (id: string, moduleName: string = 'Certification'): Promise<IResponse<IAdminCertificationName>> => {
        const url = apiURL + '/' + id;
        return axiosClient.get(url, { moduleName });
    },

    addCertificateName: (params: IAdminCertificationName): Promise<IResponse> => {
        const url = apiURL;
        return axiosClient.post(url, params);
    },

    updateCertificateName: (params: IAdminCertificationName): Promise<IResponse> => {
        const url = apiURL + '/' + params.certificateId;
        return axiosClient.put(url, params);
    },

    deleteCertificateName: (id: number | undefined): Promise<IResponse> => {
        const url = apiURL + '/' + id;
        return axiosClient.delete(url);
    }
};

export default certificationService;
