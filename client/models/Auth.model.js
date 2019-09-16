import { thunk, action } from 'easy-peasy';
import { get } from 'lodash';
import { push } from 'redux-first-history';

import { req } from '../api';
import { store } from '../store';

const doLogin = async params => {
    return req('post', '/login', params)
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

const doSignup = async params => {
    return req('post', '/signup', params)
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

export const authModel = {
    currentUser: undefined,
    loginError: undefined,
    signupError: undefined,

    setCurrentUser: action((state, payload) => {
        state.currentUser = payload;
    }),
    clearCurrentUser: action((state, _payload) => {
        state.currentUser = undefined;
    }),
    setLoginError: action((state, payload) => {
        state.loginError = payload;
    }),
    clearLoginError: action((state, _payload) => {
        state.loginError = undefined;
    }),
    setSignupError: action((state, payload) => {
        state.signupError = payload;
    }),
    clearSignupError: action((state, _payload) => {
        state.signupError = undefined;
    }),

    doLogin: thunk(async (actions, payload) => {
        return doLogin(payload)
            .then(user => {
                actions.setCurrentUser(user);
                actions.clearLoginError();
            })
            .then(() => {
                return store.dispatch(push('/'));
            })
            .catch(err => {
                actions.setLoginError(err);
            });
    }),
    doSignup: thunk(async (actions, payload) => {
        if (payload.password !== payload.confirmPassword) {
            actions.setSignupError('Passwords do not match');
            return Promise.reject('Passwords do not match');
        }

        return doSignup(payload)
            .then(user => {
                console.log('user', user);
                actions.setCurrentUser(user);
                actions.clearSignupError();
            })
            .then(user => {
                return store.dispatch(push('/'));
            })
            .catch(err => {
                actions.setSignupError(err);
            });
    }),
};
