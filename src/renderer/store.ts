import Vue from 'vue'
import Vuex from 'vuex'
import {CSS,UserConfig} from 'src/common'


Vue.use(Vuex)

export class GlobalState {
    public config = new UserConfig()
    public title: string = "Restructured Notes"
}

export interface UpdateUIStyleOptions {
    target: "toolbar" | "global"
    style: CSS,
}

const mutations = {
    setDarkMode(state: GlobalState, to: boolean) {
        state.config.useDarkMode = to;
    },

    updateUIStyle(state: GlobalState, option: UpdateUIStyleOptions) {
        let target;
        switch (option.target) {
            case "toolbar":
                target = state.config.UIStyle.toolbarStyle
                break
            case "global":
                target = state.config.UIStyle.globalStyle
                break
            default:
                target={}
                console.error("Invalid target in updateUIStyle")
                return
        }

        Object.assign(target, option.style)
    },

    updateTitle(state: GlobalState, newTitle: string) {
        state.title = newTitle;
        document.title = newTitle;
    }

} //as MutationTree<GlobalState>

const state = new GlobalState;


let store = new Vuex.Store(
    {
        state,
        mutations,
        strict: process.env.NODE_ENV !== 'production'
    }
)

export default store
