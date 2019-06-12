import axios from 'axios';
import { message } from "antd";
import { prefixRoute, needToken } from "src/configs";

//响应时间
axios.defaults.timeout = 300000; // 5 min
// axios.defaults.headers.common['datae-token'] = localStorage.getItem('token');
axios.defaults.headers.post['Content-Type'] = 'application/json';

// request interceptor
axios.interceptors.request.use((config) => {
    return config;
}, (error) => {
    return Promise.reject(error);
});

// response interceptor
axios.interceptors.response.use((response) => {
    if (response.status >= 400) {
        // 没登录或token过期
        if (response.status === 401) {
            needToken && (window.location.href = prefixRoute + '/login');
            return;
        }
        return Promise.reject(response);
    }
    return response;
}, (error) => {
    message.error('网络连接超时');
    return Promise.reject(error);
});

export const get = (url, params, config = {}) => {
    return axios.get(url, {
        params: params,
        headers: {
            'datae-token': localStorage.getItem('token'),
        },
        ...config
    });
};
export const post = (url, params, config = {}) => {
    return axios.post(url, params, {
        headers: {
            'datae-token': localStorage.getItem('token'),
        },
        ...config
    });
};

export const all = (iterable = []) => {
    return axios.all(iterable).then(axios.spread((acct, perms) => {
        // Both requests are now complete
        console.log(acct, perms);
    }))
};

export default axios;