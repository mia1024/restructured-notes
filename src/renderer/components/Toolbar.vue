<template>
    <div id="toolbar" :style="style">
        {{ title }}

    </div>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'
    import {UpdateUIStyleOptions} from "../store"
    import {CSS} from "src/common";

    import platform from "os"

    @Component
    export default class Toolbar extends Vue {
        get style(): CSS {
            if (this.isMacOS)
                this.$store.commit('updateUIStyle', {
                    target: 'toolbar',
                    style: {
                        '-webkit-app-region': 'drag',
                    }
                } as UpdateUIStyleOptions)

            return this.$store.state.config.UIStyle.toolbarStyle
        }

        get isMacOS(): boolean {
            return platform.platform() === 'darwin'
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
        box-shadow: 0 0.2px 0.5px 0 var(--foreground-color);
        top: 0;
    }

</style>