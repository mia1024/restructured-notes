<template>
    <v-app app>
        <v-main>
            <router-view :style="globalStyle"></router-view>
        </v-main>
    </v-app>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator'

    @Component
    export default class index extends Vue {
        get globalStyle() {
            return this.$store.state.config.UIStyle.globalStyle
        }
    }
</script>

<style lang="scss"></style>
