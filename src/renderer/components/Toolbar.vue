<template>
    <div id="toolbar" :style="style">
        {{ title }}
        <span v-if="isMacOS" id="toolbar-buttons">
        <button class="toolbar-button" id="close-button" onclick="window.close()"></button>
        </span>
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

        close(): void {
            window.close()
        }
    }

</script>

<style scoped lang="scss">
    @import "src/renderer/index";

    #toolbar {
        width: 100vw;
        padding: 0.5em;
        margin: 0;
        text-align: center;
        user-select: none;
        position: absolute;
        @include shadow(4);
        //-webkit-app-region: drag;
        top: 0;
    }

    #toolbar-buttons {
        -webkit-app-region: no-drag;
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
    }

    .toolbar-button {
        width: 2em;
        background-color: green;
        margin:0;
        padding:0;
    }
</style>