import { IResponse } from '@/types/common';
import { ICurrentUser, IMenuList, Login } from '../types/auth';
import axiosClient from './axios-client';
import axiosClientCas from './axios-client-cas';

const apiURL = '/authentication';
const apiURLCas = '/Authentication';
const apiPermissionURL = '/permission/menu-list';

const authApi = {
    login(params: Login): Promise<IResponse<ICurrentUser>> {
        const url = apiURL + '/login';
        return axiosClient.post(url, params);
    },
    getURLRedirect(): Promise<IResponse<ICurrentUser>> {
        const url = apiURLCas + '/login-cas';
        return axiosClientCas.get(url);
    },
    logOutCas(): Promise<IResponse<ICurrentUser>> {
        const url = apiURLCas + '/logout-cas';
        return axiosClientCas.get(url);
    },
    getPermission(): Promise<IResponse<IMenuList>> {
        const url = apiPermissionURL;
        return axiosClient.get(url);
    }
};

export default authApi;
