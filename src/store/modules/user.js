import Vue from 'vue';

import * as types from '../mutation-types';

import { Message } from 'element-ui';

import store from 'store';
import expirePlugin from 'store/plugins/expire';

import router from '../../router';

store.addPlugin(expirePlugin);

const state = {
    email: null,
    token: null
};

const getters = {
    token: ({ token }) => token,
    isLogin: ({ token }) => !!token
};

const actions = {
    login ({ dispatch, commit, state }, { email = null, token = null } = {}) {
        commit(types.USER_LOGIN, { email, token });
        dispatch('favorite/getFavoriteFromRemote', null, { root: true });
    },
    logout ({ commit, state }) {
        Message.success('You\'ve logged out.');
        router.go(router.currentRoute);
        commit(types.USER_LOGIN, { email: null, token: null });
    },
    initialize ({ dispatch, commit, state }) {
        let token = store.get('user').token;
        dispatch('login', {
            email: store.get('user').email,
            token: token
        });
    }
};

const mutations = {
    [types.USER_LOGIN] (state, { email = null, token = null } = {}) {
        state.email = email;
        state.token = token;

        let expiration = new Date().getTime() + 1 * 24 * 60 * 60 * 1000;
        store.set('user', { email, token }, expiration);

        Vue.http.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};
