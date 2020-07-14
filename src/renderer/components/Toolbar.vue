<template>
    <div id="toolbar" v-if="isMacOS" :style="style">
        <slot name="default">
            {{ title }}
        </slot>
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
        user-input: none;
        position: absolute;
        @include shadow(4);
        -webkit-app-region: drag;
        top: 0;
    }

    #toolbar-buttons {
        -webkit-app-region: no-drag;
        position: absolute;
        right: 0;
        top: 0;
        height: 100%;
        display: flex;
        flex-direction: row-reverse;
        flex-wrap: nowrap;
    }

    .toolbar-button {
        width: 2.5em;
        margin: 0;
        padding: 0;
        overflow: hidden;
        outline: none;

    }

    #minimize-button {
        background-color: yellow;
    }

    #maximize-button {
        background-color: green;
    }

    #close-button {
        &:before, &:after {
            /*
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        */
            position: absolute;
            /*left: 15px;*/
            content: ' ';
            height: 2.5em;
            width: 2px;
            background-color: black;
        }

        &:before {
            transform: rotate(45deg);
        }

        &:after {
            transform: rotate(-45deg);
        }
    }


</style>