import { thunk, action } from 'easy-peasy';
import { get } from 'lodash';

import { authReq } from '../api';
// import { store } from '../store';

const getChannels = async params => {
    return authReq('get', '/streams', params)
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

const getChannel = async (streamName, params) => {
    return authReq('get', `/streams/${streamName}`, params)
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

export const channelsModel = {
    channels: [],
    currentChannel: {},

    setCurrentChannel: action((state, payload) => {
        state.currentChannel = payload;
    }),
    clearCurrentChannel: action((state, _payload) => {
        state.currentChannel = [];
    }),
    setChannels: action((state, payload) => {
        state.channels = payload;
    }),
    clearChannels: action((state, _payload) => {
        state.channels = [];
    }),
    getChannels: thunk(async (actions, payload) => {
        return getChannels(payload).then(channels => {
            actions.setChannels(channels);
        });
    }),
    getChannel: thunk(async (actions, payload) => {
        console.log('payload', payload);
        return getChannel(payload.streamName, payload.params).then(channel => {
            actions.setCurrentChannel(channel);
        });
    }),
};
