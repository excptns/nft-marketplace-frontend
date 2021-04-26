import Vue from "vue";
import AccountModel from '~/components/model/account'
import { LOCAL_STORAGE } from "~/constants";
import { LocalStorage } from "~/utils";

export const action = {
    reset({ commit }) {
        commit("reset");
    },

    logout({ dispatch }) {
        dispatch('reset');
        dispatch('trunk/resetBalances', {}, { root: true })
        LocalStorage.remove(LOCAL_STORAGE.authToken);
        Vue.logger.stopTrack();
    },

    // do login
    async doLogin({ dispatch, commit }, payload) {
        if (!payload || !payload.address || !payload.signature) {
            console.log('User addresss and Signature is required for login')
            return
        }

        const response = await Vue.service.user.login(payload);
        const user = response.data.data;
        if (response.status === 200 && user) {
            const authToken = response.data.auth_token;
            dispatch("initUser", {
                loginStrategy: payload.loginStrategy,
                authToken: authToken,
                user: user,
            })
            LocalStorage.set(LOCAL_STORAGE.authToken, authToken);
            LocalStorage.set(LOCAL_STORAGE.loginStrategy, payload.loginStrategy);
        }
        return null
    },

    async initUser({ dispatch, commit, getters }, { loginStrategy, authToken, user, }) {
        commit('setLoginStrategy', loginStrategy)
        commit('setToken', authToken)
        commit('setUser', user);
        commit('account/account', new AccountModel({
            address: user.address
        }),
            {
                root: true
            }
        )
        await dispatch('token/reloadBalances', null, { root: true });
        await dispatch('account/fetchActiveOrders', null, { root: true });
        await dispatch('account/fetchFavoritesOrders', null, { root: true });
        Vue.logger.initTrack({ address: getters['address'] })
    },
    async getUser({ dispatch }) {
        const response = await Vue.service.user.getDetails();
        const user = response.data.data;
        if (response.status === 200 && user) {
            dispatch("initUser", {
                loginStrategy: LocalStorage.get(LOCAL_STORAGE.loginStrategy),
                authToken: LocalStorage.get(LOCAL_STORAGE.authToken),
                user: user,
            })
            return true;
        }
        return false;
    },
    async getConfig({ dispatch }) {
        const response = await Vue.service.user.getConfig();
        const config = response.data.data;
        if (response.status === 200 && config) {
            if (config.isAuthenticated) {
                await dispatch("getUser")
            }
            return true;
        }
        return false;
    },
}
