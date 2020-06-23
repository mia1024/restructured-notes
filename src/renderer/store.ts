import Vue from 'vue'
import Vuex from 'vuex'
import Style from './style'
import UserConfig from './config'


Vue.use(Vuex)

export class GlobalState {
    public config = new UserConfig()
    public title: string = "Restructured Notes"
}

export interface updateElementStyleOptions {
    target: "toolbar"
    style: Style,
}

const mutations = {
    setDarkMode(state: GlobalState, to: boolean) {
        state.config.useDarkMode = to;
    },
    updateElementStyle(state: GlobalState, option: updateElementStyleOptions) {
        let target;
        switch (option.target) {
            case "toolbar":
                target = state.config.style.UIStyle.toolbarStyle
                break
            default:
                target={}
                console.warn("Invalid target in updateElementStyle")
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
