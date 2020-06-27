<template>
    <div id="toolbar" :style="style">
        {{ title }}

    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    //import {UpdateUIStyleOptions} from "../store"
    import {CSS} from "src/common";


    @Component
    export default class Toolbar extends Vue {
        get style(): CSS {
            return this.$store.state.config.UIStyle.toolbarStyle
        }

        get isMacOS(): boolean {
            return process.platform === 'darwin'
        }

        get title(): string {
            return this.$store.state.title
        }
    }

</script>

<style scoped type="text/scss">
    #toolbar {
        width: 100vw;
        padding: 0.5em;
        text-align: center;
        user-select: none;
        position: absolute;
        box-shadow: 0 0.5px 0.5px 0 var(--foreground-color);
        -webkit-app-region:drag;
        user-select: none;
        top: 0;
    }

</style>