<template>
    <v-app app :style="colorScheme">
        <toolbar/>

        <v-main>
        </v-main>
    </v-app>

</template>


<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import Toolbar from "./components/Toolbar.vue";


    @Component({
        components: {Toolbar: Toolbar}
    })
    export default class App extends Vue {

        get colorScheme() {
            let config = this.$store.state.config
            let cssVars: any = {}
            let theme;

            if (config.useDarkMode) {
                theme = config.style.UIStyle.darkTheme
            } else {
                theme = config.style.UIStyle.lightTheme
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