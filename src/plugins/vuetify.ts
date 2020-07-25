import Vue from "vue"
import Vuetify from "vuetify/lib"
import {UserConfig} from "src/common";

Vue.use(Vuetify)


export default new Vuetify({
    theme:{
        dark:(new UserConfig()).useDarkMode
    }
})