import Vue from "vue"
import Index from './entry.vue'
import vuetify from "src/plugins/vuetify"
import store from "./store"
import router from "./router";
import "./index.scss"
import "@mdi/font/scss/materialdesignicons.scss"
import AsyncComputedPlugin from 'vue-async-computed'
import {
    commitConfigFileAndTag,
    commitConfigFileWithSystemSignature,
    configDirPath,
    isConfigModified, UserConfig
} from "../common"
import {ipcRenderer} from 'electron'

if (module.hot) {
    module.hot.accept()
}

// always update with the latest copy of default configs
window.addEventListener("beforeunload", async (e) => {
    store.state.config.save()
    if (await isConfigModified(configDirPath)) {
        await commitConfigFileAndTag(configDirPath)
    }
})

export function restartRenderer() {
    ipcRenderer.sendSync('restart', {immediate: true})
}

Vue.use(AsyncComputedPlugin);

if ((new UserConfig()).showWelcomeScreen)
    router.push('/getting-started')

new Vue({
    vuetify,
    store,
    router,
    render: h => h(Index),
}).$mount("#app")

