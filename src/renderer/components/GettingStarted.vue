<template>
    <v-app app>
        <v-main>
            <toolbar>
                <template v-slot:default>
                    Getting Started
                </template>
            </toolbar>
            <div id="contents">

                <v-expansion-panels :accordion="true" :value="openPanelIdx" v-model="openPanelIdx">
                    <!--Theme Selection-->
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <template v-slot:default="{ open }">
                                <v-row no-gutters>
                                    <v-col cols="4">Color Theme</v-col>
                                    <v-col cols="8" class="text--secondary">
                                        <v-fade-transition>
                                            <span v-if="!open">{{useDarkTheme?"Dark":"Light"}}</span>
                                        </v-fade-transition>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row align="center">
                                <v-col>
                                    <v-radio-group v-model="useDarkTheme" row
                                                   @change="openPanelIdx++;refs.name.focus()">
                                        <v-radio label="Light"></v-radio>
                                        <v-radio label="Dark"></v-radio>
                                    </v-radio-group>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                        <!--/ Theme Selection-->
                    </v-expansion-panel>

                    <v-expansion-panel>
                        <!-- Name and Email -->
                        <v-expansion-panel-header>
                            <template v-slot:default="{open}">
                                <v-row no-gutters>
                                    <v-col cols="4">
                                        Name and Email
                                    </v-col>
                                    <v-fade-transition>
                                        <v-col cols="8" v-if="!open" class="text--secondary">
                                            {{name}} <{{email}}>
                                        </v-col>
                                    </v-fade-transition>
                                </v-row>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row align="end">
                                <v-col cols="6" ref="name" @keyup.enter="refs.email.focus()" :autofocus="true">
                                    <v-text-field label="Name" placeholder="Joanna Smith" v-model="name"
                                                  :rules="[validateName]" validate-on-blur/>
                                </v-col>
                                <v-col cols="6" ref="email"
                                       @keyup.enter="validateEmail()&&validateName()?openPanelIdx++:null"
                                       :autofocus="true">
                                    <v-text-field label="Email" placeholder="user@example.com" v-model="email"
                                                  type="email" validate-on-blur :rules="[validateEmail]"/>
                                </v-col>
                            </v-row>
                            <v-row justify="end">
                                <v-col cols="2">
                                    <v-btn @click="validateEmail()&&validateName()?openPanelIdx++:null" outlined>Next
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                        <!--/ Name and Email -->
                    </v-expansion-panel>

                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            <template v-slot:default="{open}">
                                <v-row no-gutters>
                                    <v-col cols="4">
                                        Default Notebook Location
                                    </v-col>
                                    <v-fade-transition>
                                        <v-col cols="8" v-if="!open" class="text--secondary">
                                            {{notebookBaseDir}}
                                        </v-col>
                                    </v-fade-transition>
                                </v-row>
                            </template>
                        </v-expansion-panel-header>
                        <v-expansion-panel-content>
                            <v-row align="baseline">
                                <v-col cols="10">
                                    <v-text-field v-model="notebookBaseDir"
                                                  @keydown.enter="validateNotebookDir()===true?openPanelIdx++:undefined"
                                                  :rules="[validateNotebookDir]"
                                                  validate-on-blur
                                    />
                                </v-col>
                                <v-col cols="2">
                                    <v-btn tile outlined small @click="getDirectoryPath">&hellip;</v-btn>
                                </v-col>
                            </v-row>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-expansion-panels>
                <v-row justify="end" style="margin-right: 0; margin-top:1em">
                    <v-btn @click="saveAndExit">Let's Go</v-btn>
                </v-row>
            </div>

        </v-main>
    </v-app>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {Toolbar} from ".";
    import {restartRenderer, showErrorWindow} from "src/renderer";
    import AsyncComputed from 'vue-async-computed-decorator'
    import {configDirPath, getGlobalEmail, getGlobalUsername, initRepoAndCommitAll} from "src/common";
    import {join} from 'path'
    import {existsSync, lstatSync, mkdirSync} from "fs";

    @Component({
        components: {Toolbar}
    })
    export default class GettingStarted extends Vue {
        constructor() {
            super();
            this.$store.commit('setTitle', 'Getting Started')
            getGlobalEmail().then(v => this.$store.commit('updateGitConfig', {email: v}))
            getGlobalUsername().then(v => this.$store.commit('updateGitConfig', {name: v}))
        }

        private _darkThemeSelection: number | boolean = 0;

        openPanelIdx = 0

        get refs() {
            return this.$refs
        }

        get useDarkTheme() {
            return this._darkThemeSelection
        }

        set useDarkTheme(v: number | boolean) {
            this.$store.commit('setDarkMode', Boolean(v))
            this._darkThemeSelection = v
            this.$vuetify.theme.dark = Boolean(v)
        }

        public _name?: string; // it has to be public for async fetch
        public _email?: string;

        get name() {
            return this.$store.state.config.git.name
        }

        set name(v: string) {
            this.$store.commit('updateGitConfig', {name: v})
        }

        get email() {
            return this.$store.state.config.git.email
        }

        set email(v) {
            this.$store.commit('updateGitConfig', {email: v})
        }

        get notebookBaseDir() {
            return this.$store.state.config.notebookBaseDir
        }

        set notebookBaseDir(path: string) {
            this.$store.commit('setNotebookBaseDir', path)
        }

        validateName() {
            return this.name.length > 0
        }

        validateEmail() {
            const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            return pattern.test(this.email)
        }

        getDirectoryPath() {
            let electron = require('electron')
            let sel = electron.remote.dialog.showOpenDialogSync(
                electron.remote.getCurrentWindow(), {
                    defaultPath: this.notebookBaseDir,
                    properties: [
                        'openDirectory',
                        'showHiddenFiles',
                        'createDirectory',
                        'promptToCreate',
                        'treatPackageAsDirectory',
                        'dontAddToRecent'
                    ]
                })
            if (sel)
                this.notebookBaseDir = join(sel[0], 'Restructured Notes')
        }

        validateNotebookDir() {
            if (existsSync(this.notebookBaseDir))
                if (!lstatSync(this.notebookBaseDir).isDirectory())
                    return 'File exists'
            return true
        }

        restart() {
            restartRenderer()
        }

        saveAndExit() {
            if (!(this.validateName() && this.validateEmail())) {
                this.openPanelIdx = 1
                return
            }
            if (this.validateNotebookDir() !== true) {
                this.openPanelIdx = 2
                return
            }
            mkdirSync(this.notebookBaseDir, {recursive: true})
            this.$store.state.config.showWelcomeScreen=false
            this.$store.state.config.save()
            initRepoAndCommitAll(configDirPath,'Config Generated in Getting Started',true).then(
                _=>this.$router.push('/')
            ).catch(e=>{
                showErrorWindow({
                    title:"Error",
                    message:'Cannot create git repository',
                    detail:e.stack
                })
            })
        }
    }
</script>

<style scoped lang="scss">
    @import "src/renderer/index";

    #contents {
        width: 80%;
        margin: auto;
        margin-top: 4em;
    }
</style>