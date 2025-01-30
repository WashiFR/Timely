import {defineStore} from "pinia";

export const useApiKeysStore = defineStore('apiKeys', {
    state()
    {
        return {
            apiKey: '',
        }
    },
    getters: {
        hasApiKey: (state) => state.apiKey !== '',
    },
    actions: {
        setApiKey(apiKey) {
            this.apiKey = apiKey
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                storage: localStorage,
                paths: ['apiKey'],
            }
        ]
    }
})
