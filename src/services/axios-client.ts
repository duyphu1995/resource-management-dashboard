import pathnames from '@/pathnames';
import axios from 'axios';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const handleExpiredToken = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    window.location.href = pathnames.login.path;
};

declare module 'axios' {
    export interface AxiosRequestConfig {
        moduleName?: string;
    }
}

export interface TokenDecodeModel {
    exp: number;
}

export const getToken = () => {
    const token: string = Cookies.get('token') || '';

    if (token) {
        // Check expired token
        const tokenDecode: TokenDecodeModel = jwtDecode(token);
        const exp = tokenDecode.exp * 1000;
        const now = new Date().getTime();
        const isExpired = exp - now <= 0;

        if (isExpired) return handleExpiredToken();
    }

    return token;
};

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: { 'content-type': 'application/json;' }
});

axiosClient.interceptors.request.use(async config => {
    const token = getToken();

    if (token) config.headers.Authorization = `Bearer ${token}`;

    if (config.moduleName) config.headers['Module-Name'] = config.moduleName;

    return config;
});

axiosClient.interceptors.response.use(
    response => response?.data,

    async error => {
        const { response } = error;
        const { status } = response;

        if (status === 401) return handleExpiredToken();

        if (response?.data instanceof Blob) {
            try {
                // Convert blob to text
                const errorText = await response.data.text();
                const errorJson = JSON.parse(errorText);

                return { ...errorJson, status };
            } catch (parseError) {
                return { message: 'An unknown error occurred', status };
            }
        }

        return { ...response.data, status };
    }
);

export default axiosClient;
