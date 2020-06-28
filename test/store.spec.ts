import expect from 'expect'
import store, {UpdateUIStyleOptions,UpdateColorSchemeOptions} from "src/renderer/store"

describe('src/render/store.ts', () => {
    it('sets dark mode correctly', () => {
        store.commit('setDarkMode', true)
        expect(store.state.config.useDarkMode).toBeTruthy()
        store.commit('setDarkMode', false)
        expect(store.state.config.useDarkMode).toBeFalsy()
    })

    it('sets title correctly', () => {
        const title = Math.random().toString()
        store.commit('setTitle', title)
        expect(store.state.title).toBe(title)
    })

    it('updates toolbar correctly', () => {
        expect(store.state.config.UIStyle.toolbarStyle["pointer-events"]).toBeUndefined()
        expect(store.state.config.UIStyle.toolbarStyle["user-select"]).toBeUndefined()

        store.commit('updateUIStyle', {
            target: 'toolbar',
            style: {
                'pointer-events': 'none',
                'user-select': 'none'
            }
        } as UpdateUIStyleOptions)

        expect(store.state.config.UIStyle.toolbarStyle["pointer-events"]).toBe('none')
        expect(store.state.config.UIStyle.toolbarStyle["user-select"]).toBe('none')
    })

    it('updates global styles correctly',()=>{
        expect(store.state.config.UIStyle.globalStyle["pointer-events"]).toBeUndefined()
        expect(store.state.config.UIStyle.globalStyle["user-select"]).toBeUndefined()

        store.commit('updateUIStyle', {
            target: 'global',
            style: {
                'pointer-events': 'none',
                'user-select': 'none'
            }
        } as UpdateUIStyleOptions)

        expect(store.state.config.UIStyle.globalStyle["pointer-events"]).toBe('none')
        expect(store.state.config.UIStyle.globalStyle["user-select"]).toBe('none')
    })

    it('updates color correctly',()=>{
        const r=Math.min(255,Math.ceil(Math.random()*250))
        const g=Math.min(255,Math.ceil(Math.random()*250))
        const b=Math.min(255,Math.ceil(Math.random()*250))
        const a=Math.random().toFixed(2)
        const color=`rgba(${r},${g},${b},${a})`

        expect(store.state.config.UIStyle.lightTheme.foregroundColor).not.toBe(color)
        expect(store.state.config.UIStyle.lightTheme.backgroundColor).not.toBe(color)
        expect(store.state.config.UIStyle.lightTheme.accentColor).not.toBe(color)
        expect(store.state.config.UIStyle.lightTheme.highlightColor).not.toBe(color)
        expect(store.state.config.UIStyle.lightTheme.shadowColor).not.toBe(color)

        expect(store.state.config.UIStyle.darkTheme.foregroundColor).not.toBe(color)
        expect(store.state.config.UIStyle.darkTheme.backgroundColor).not.toBe(color)
        expect(store.state.config.UIStyle.darkTheme.accentColor).not.toBe(color)
        expect(store.state.config.UIStyle.darkTheme.highlightColor).not.toBe(color)
        expect(store.state.config.UIStyle.darkTheme.shadowColor).not.toBe(color)

        store.commit('updateColorScheme',{
            target:'dark',
            colors:{
                foregroundColor:color,
                backgroundColor:color,
                accentColor:color,
                highlightColor:color,
                shadowColor:color
            }
        } as UpdateColorSchemeOptions)

        expect(store.state.config.UIStyle.darkTheme.foregroundColor).toBe(color)
        expect(store.state.config.UIStyle.darkTheme.backgroundColor).toBe(color)
        expect(store.state.config.UIStyle.darkTheme.accentColor).toBe(color)
        expect(store.state.config.UIStyle.darkTheme.highlightColor).toBe(color)
        expect(store.state.config.UIStyle.darkTheme.shadowColor).toBe(color)

        store.commit('updateColorScheme',{
            target:'light',
            colors:{
                foregroundColor:color,
                backgroundColor:color,
                accentColor:color,
                highlightColor:color,
                shadowColor:color
            }
        } as UpdateColorSchemeOptions)

        expect(store.state.config.UIStyle.lightTheme.foregroundColor).toBe(color)
        expect(store.state.config.UIStyle.lightTheme.backgroundColor).toBe(color)
        expect(store.state.config.UIStyle.lightTheme.accentColor).toBe(color)
        expect(store.state.config.UIStyle.lightTheme.highlightColor).toBe(color)
        expect(store.state.config.UIStyle.lightTheme.shadowColor).toBe(color)
    })
})