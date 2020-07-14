<template>
    <v-app>
        <v-main>
            <h1>Error</h1>

            <br>
            <router-link to="/app">Go back to the main page</router-link>
            <br>
            <br>
            <label for="bug">
                Please file a bug report.
            </label>
            <br>
            <textarea name="bug" id="bug" rows="5" cols="60">
                Location {{location}} not found. Referer is {{referer}}.
                OS: {{platform}}
                Kernel: {{release}}
                Time: {{(new Date).toUTCString()}}
            </textarea>

        </v-main>
    </v-app>
</template>

<script lang="ts">
    import {Vue, Component} from "vue-property-decorator";
    import {platform, release, networkInterfaces} from "os";

    @Component
    export default class NotFound extends Vue {
        get location() {
            let absPath = window.location.href
            console.error('Failed to load ', absPath)
            try {
                // @ts-ignore: TS2531,TS2532. Error caught below.
                return absPath.match(/.*(?:index\.html|localhost:\d{1,5})(?<path>.*)/i).groups.path
            } catch (e) {
                return 'undefined'
            }
        }

        get referer() {
            // @ts-ignore: TS2339
            let referer=this.$router.referer
            if (referer)
                return referer.path
            return 'null'
        }

        get platform() {
            return platform()
        }

        get release() {
            return release()
        }

        get network() {
            return networkInterfaces()
        }

    }
</script>

<style lang="scss" scoped>
    body {
        main{
            margin: 1.5em;
        }
        background-color: white;
        color: black;
        font-size: 16px;
        font-family: 'Roboto Mono', monospace;
        -webkit-app-region: drag;
        user-select: none;
        outline: none;
        text-rendering: optimizeLegibility;

        h1 {
            text-align: center;
        }

        textarea {
            user-select: auto;
            -webkit-app-region: no-drag;
            border: 1px solid black;
        }
    }
</style>