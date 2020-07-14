import Vue from "vue"
import Vuetify from "vuetify"
import "vuetify/dist/vuetify.min.css"
import {UserConfig} from "../common";

Vue.use(Vuetify)


export default new Vuetify({
    theme:{
        dark:(new UserConfig()).useDarkMode
    }
})