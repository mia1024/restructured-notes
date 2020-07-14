<template>
    <router-view :style="globalStyle"></router-view>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'

    @Component
    export default class index extends Vue{
        get globalStyle(){
            let global= {...(this.$store.state.config.UIStyle.globalStyle)}
            Object.assign(global,this.colorScheme)
            return global
        }

        get colorScheme() {
            const config = this.$store.state.config
            const cssVars: any = {}
            let theme;

            if (config.useDarkMode) {
                theme = config.UIStyle.darkTheme
            } else {
                theme = config.UIStyle.lightTheme
            }
            cssVars['--foreground-color'] = theme.foregroundColor
            cssVars['--background-color'] = theme.backgroundColor
            cssVars['--accent-color'] = theme.accentColor
            cssVars['--highlight-color'] = theme.highlightColor
            return cssVars
        }
    }
</script>

<style lang="scss"></style>
