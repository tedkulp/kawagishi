import { thunk, action } from 'easy-peasy';
import { get } from 'lodash';

import { authReq } from '../api';

const getMe = () => {
    return authReq('get', '/users/me')
        .then(response => {
            if (response.status > 399) {
                return Promise.reject(response.data);
            } else {
                return response.data;
            }
        })
        .catch(error => {
            const erroMessage = get(error, 'response.data.error');
            return Promise.reject(erroMessage);
        });
};

const resetStreamingKey = () => {
    return authReq('put', '/users/me/reset_streaming_key')
        .then(response => {
            if (response.status > 399) {
                return Promise.reject(response.data);
            } else {
                return response.data;
            }
        })
        .catch(error => {
            const erroMessage = get(error, 'response.data.error');
            return Promise.reject(erroMessage);
        });
};

const inviteUser = payload => {
    return authReq('post', '/users/invite_user', payload)
        .then(response => {
            if (response.status > 399) {
                return Promise.reject(response.data);
            } else {
                return response.data;
            }
        })
        .catch(error => {
            const erroMessage = get(error, 'response.data.errors');
            return Promise.reject(erroMessage);
        });
};

export const userModel = {
    currentUser: undefined,
    error: undefined,
    msg: undefined,

    setCurrentUser: action((state, payload) => {
        state.currentUser = payload;
    }),
    clearCurrentUser: action((state, _payload) => {
        state.currentUser = undefined;
    }),
    setError: action((state, payload) => {
        state.error = payload;
    }),
    clearError: action((state, _payload) => {
        state.error = undefined;
    }),
    setMsg: action((state, payload) => {
        state.msg = payload;
    }),
    clearMsg: action((state, _payload) => {
        state.msg = undefined;
    }),

    getMe: thunk(async (actions, _payload) => {
        return getMe()
            .then(user => {
                actions.setCurrentUser(user);
            })
            .catch(err => {
                // actions.setLoginError(err);
            });
    }),

    resetStreamingKey: thunk(async (actions, _payload) => {
        return resetStreamingKey()
            .then(() => {
                return actions.getMe();
            })
            .catch(err => {
                throw err;
            });
    }),

    inviteUser: thunk(async (actions, payload) => {
        actions.clearError();
        actions.clearMsg();

        return inviteUser(payload)
            .then(ret => {
                actions.setMsg('Invite Sent!');
                return ret;
            })
            .catch(err => {
                actions.setError(err);
            });
    }),
};
