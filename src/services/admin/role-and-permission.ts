import { ICreateRole, ICreateUserPermission, IDetailUserRole, IRoleList, IUserPermissionDetail } from '@/types/admin';
import { IResponse } from '@/types/common';
import { IEmployee } from '@/types/hr-management/employee-management';
import axiosClient from '../axios-client';

const apiURL = '/permission';

const roleAndPermissionService = {
    getAllIndex: (): Promise<IResponse<any[]>> => {
        const url = apiURL + '/role-and-permission/allindex';
        return axiosClient.get(url);
    },

    getAllPermissionList: (): Promise<IResponse<any[]>> => {
        const url = apiURL + '/permission-list';
        return axiosClient.get(url);
    },

    getAllRoleList: (): Promise<IResponse<IRoleList[]>> => {
        const url = apiURL + '/role-and-permission/user-roles';
        return axiosClient.get(url);
    },

    createRole: (params: ICreateRole): Promise<IResponse<any>> => {
        const url = apiURL + '/role-and-permission/user-roles';
        return axiosClient.post(url, params);
    },

    updateRole: (params: ICreateRole, roleGroupId: string): Promise<IResponse<any>> => {
        const url = apiURL + '/role-and-permission/user-roles' + '/' + roleGroupId;
        return axiosClient.put(url, params);
    },

    getDetailUserRole: (roleGroupId: string): Promise<IResponse<IDetailUserRole>> => {
        const url = apiURL + '/role-and-permission/user-roles' + '/' + roleGroupId;
        return axiosClient.get(url);
    },

    delete: (roleGroupId: number): Promise<IResponse> => {
        const url = apiURL + '/role-and-permission/user-roles' + '/' + roleGroupId;
        return axiosClient.delete(url);
    },

    getUserPermission: (params: any): Promise<IResponse<IUserPermissionDetail[]>> => {
        const url = apiURL + '/role-and-permission/user-permissions/search';
        return axiosClient.post(url, params);
    },

    addUserPermission: (params: any): Promise<IResponse<any>> => {
        const url = apiURL + '/role-and-permission/user-permissions';
        return axiosClient.post(url, params);
    },

    getUserPermissionDetail: (employeeId: string): Promise<IResponse<IUserPermissionDetail>> => {
        const url = apiURL + '/role-and-permission/user-permissions' + '/' + employeeId;
        return axiosClient.get(url);
    },

    updateUserPermission: (params: ICreateUserPermission, employeeId: string): Promise<IResponse> => {
        const url = apiURL + '/role-and-permission/user-permissions' + '/' + employeeId;
        return axiosClient.put(url, params);
    },

    deleteUserPermission: (employeeId: number): Promise<IResponse> => {
        const url = apiURL + '/role-and-permission/user-permissions' + '/' + employeeId;
        return axiosClient.delete(url);
    },

    getUerPermissionByRole: (roleGroupId: string): Promise<IResponse<any[]>> => {
        const url = apiURL + '/role-and-permission/user-permission-by-role' + '/' + roleGroupId;
        return axiosClient.get(url);
    },

    getEmployeeInformation: (searchText = ''): Promise<IResponse<IEmployee>> => {
        const url = apiURL + '/role-and-permission/employee-info?searchText=' + encodeURI(searchText);
        return axiosClient.get(url);
    },

    checkExistUserPermission: (employeeId: number): Promise<IResponse<any[]>> => {
        const url = apiURL + `/role-and-permission/check-exists-and-get-permission-data?employeeId=${employeeId}`;
        return axiosClient.get(url);
    },

    addUserPermissionByUnit: (params: any, unitId: string): Promise<IResponse<any>> => {
        const url = apiURL + '/role-and-permission/unit-permissions' + '/' + unitId;
        return axiosClient.post(url, params);
    }
};

export default roleAndPermissionService;
