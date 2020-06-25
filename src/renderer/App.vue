<template>
    <v-app app :style="globalStyle" >
        <toolbar/>

        <v-main>
        </v-main>
    </v-app>

</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import Toolbar from "@components/Toolbar.vue";


    @Component({
        components: {Toolbar: Toolbar}
    })
    export default class App extends Vue {
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

<style type="text/scss">
    #app {
        transition: color 200ms ease,
        background-color 200ms ease,
        background 200ms ease;
        color:var(--foreground-color);
        background-color: var(--background-color);
        -webkit-font-smoothing: subpixel-antialiased;
        text-rendering: optimizeLegibility;
    }
</style>