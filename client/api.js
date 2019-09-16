import axios from 'axios';
import _ from 'lodash';

import { store } from './store';

const API_URL = '/api/v1';

const _performRequest = (method, url, params, auth, config = {}) => {
    const body = method === 'get' ? 'params' : 'data';
    const requestConfig = {
        ...config,
        method,
        url,
        baseURL: API_URL,
        [body]: _.pickBy(params, _.identity) || {},
    };

    if (_.get(config, 'allowNull', false) || _.get(config, 'allowFalse', false)) {
        requestConfig[body] = params;
    }

    requestConfig.headers = {
        Accept: 'application/json',
    };

    if (auth) {
        const token = get(store.getState(), 'Auth.currentUser.token');
        if (token) {
            requestConfig.headers['Authorization'] = token;
        }
    }

    return axios.request(requestConfig);
};

export function req(method, url, params, config) {
    return _performRequest(method, url, params, false, config);
}

export function authReq(method, url, params, config) {
    return _performRequest(method, url, params, true, config);
}

export default {
    req,
    authReq,
};
