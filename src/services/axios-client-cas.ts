import axios from 'axios';

const axiosClientCas = axios.create({
    baseURL: import.meta.env.VITE_CAS_AUTH_BASE_URL,
    headers: { 'content-type': 'application/json;' },
    withCredentials:true,
});

axiosClientCas.interceptors.response.use(
    // Successfully
    response => response?.data,

    // Failed
    error => {
        const { status } = error.response;
        const response = { ...error.response.data, status: status };

        return response;
    }
);

export default axiosClientCas;
