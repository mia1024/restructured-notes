import Vue from "vue"
import Vuex from "vuex"
import {CSS, UserConfig} from "src/common"


Vue.use(Vuex)

export class GlobalState {
    public config = new UserConfig()
    public title = "Restructured Notes"
}

export interface UpdateUIStyleOptions {
    target: "toolbar" | "global"
    style: CSS,
}

export interface UpdateColorSchemeOptions {
    target: "dark" | "light"
    colors: {
        foregroundColor?: string
        backgroundColor?: string
        accentColor?: string
        highlightColor?: string
    }
}

const mutations = {
    setDarkMode(state: GlobalState, to: boolean) {
        state.config.useDarkMode = to
    },

    updateUIStyle(state: GlobalState, option: UpdateUIStyleOptions) {
        let target
        switch (option.target) {
        case "toolbar":
            target = state.config.UIStyle.toolbarStyle
            break
        case "global":
            target = state.config.UIStyle.globalStyle
            break
        default:
            target = {}
            console.error("Invalid target in updateUIStyle")
            return
        }

        Object.assign(target, option.style)
    },

    updateColorScheme(state:GlobalState,option:UpdateColorSchemeOptions){
        let target
        switch (option.target) {
        case "dark":
            target=state.config.UIStyle.darkTheme
            break
        case "light":
            target=state.config.UIStyle.lightTheme
            break
        }
        Object.assign(target,option.colors)
    },

    setTitle(state: GlobalState, newTitle: string) {
        state.title = newTitle
        document.title = newTitle
    }

} //as MutationTree<GlobalState>

const state = new GlobalState


const store = new Vuex.Store(
    {
        state,
        mutations,
        strict: process.env.NODE_ENV !== "production"
    }
)

export default store
