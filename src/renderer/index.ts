import Vue from "vue"
import App from "./App.vue"
import vuetify from "../plugins/vuetify"
import store from "./store"
import "./index.scss"
import "@mdi/font/scss/materialdesignicons.scss"
import {commitConfigFileAndTag, commitConfigFileWithSystemSignature, configDirPath, isConfigModified} from "../common"

if (module.hot) {
    module.hot.accept()
}

// always update with the latest copy of default configs
window.addEventListener("beforeunload", async (e) => {
    store.state.config.save()
    if (await isConfigModified(configDirPath)){
        await commitConfigFileAndTag(configDirPath)
    }
})


new Vue({
    vuetify,
    store,
    render: h => h(App),
}).$mount("#app")

