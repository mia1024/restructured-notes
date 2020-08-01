<template>
    <div :style="globalStyle" id="wrap-getting-started">
        <toolbar>
            <template v-slot:default>
                Getting Started
            </template>
        </toolbar>
        <div id="contents">
            <v-card outlined style="margin-bottom: 1em">
                <v-card-title>
                    Getting Started
                </v-card-title>
                <v-card-text>
                    It appears this is the first time you use Restructured Notes.
                    Please fill out some details below to get started. Don't worry,
                    none of the information collected will leave your computer
                    unless you explicitly do so (such as a cloud sync that will be supported
                    in the future versions).
                </v-card-text>
            </v-card>

            <v-expansion-panels accordion :value="openPanelIdx" v-model="openPanelIdx" class="elevation-0">
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
                                               @change="openPanelIdx++">
                                    <v-radio label="Light"></v-radio>
                                    <v-radio label="Dark"></v-radio>
                                </v-radio-group>
                            </v-col>
                        </v-row>
                    </v-expansion-panel-content>
                    <!--/ Theme Selection-->
                </v-expansion-panel>

                <v-expansion-panel>
                    <!--Font selection-->
                    <v-expansion-panel-header>
                        <template v-slot:default="{ open }">
                            <v-row no-gutters>
                                <v-col cols="4">Font</v-col>
                                <v-col cols="8" class="text--secondary">
                                    <v-fade-transition>
                                        <span v-if="!open">{{selectedFontFamily}}, {{selectedFontSize}}px</span>
                                    </v-fade-transition>
                                </v-col>
                            </v-row>
                        </template>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content>
                        <v-row align="center" no-gutters>
                            <v-col cols="2">
                                <v-checkbox label="monospace only" v-model="showMonospacedFontOnly"/>
                            </v-col>

                            <v-col cols="4">
                                <v-select :items="fontsList" v-model="selectedFontFamily" label="Font"/>
                            </v-col>
                            <v-col cols="1"/>
                            <v-col cols="1">
                                <v-text-field type="number" v-model="selectedFontSize" label="Font Size" suffix="px"
                                              size="2" @keydown.enter="openPanelIdx++"/>
                            </v-col>
                            <v-spacer/>
                            <v-btn @click="openPanelIdx++" outlined>Next</v-btn>
                        </v-row>
                    </v-expansion-panel-content>
                    <!--/ Font selection-->
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
                        <v-row justify="end" align="center">
                            <v-col cols="4">
                                <v-dialog width="50vw" v-if="autoCollectedNameOrEmail">
                                    <template v-slot:activator="{on,attrs}">
                                        <v-btn v-bind="attrs" v-on="on" outlined x-small>How do you know this?
                                        </v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title></v-card-title>
                                        <v-card-text>
                                            <p>
                                                Short answer: from <code>{{gitConfigPath}}</code>.
                                            </p>
                                            Since Restructured Notes heavily relies on git under the hook,
                                            we decided it's better to match the settings here to your global git
                                            settings, in case you want to do something else with your git
                                            repositories.
                                        </v-card-text>
                                    </v-card>
                                </v-dialog>
                            </v-col>
                            <v-spacer/>
                            <v-col cols="auto">
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
                            <v-col cols="auto">
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
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {Toolbar} from ".";
    import {restartRenderer, showErrorWindow} from "src/renderer";
    import {Promised} from 'vue-promised'
    import {
        configDirPath,
        getGlobalConfigPath,
        getGlobalEmail,
        getGlobalUsername,
        initRepoAndCommitAll
    } from "src/common";
    import {join} from 'path'
    import {existsSync, lstatSync, mkdirSync} from "fs";
    import AsyncComputed from "vue-async-computed-decorator";
    import FontManager from 'font-scanner'

    @Component({
        components: {Toolbar}
    })
    export default class GettingStarted extends Vue {

        public openPanelIdx = -1
        public showMonospacedFontOnly: boolean = true

        get globalStyle() {
            return this.$store.state.config.UIStyle.globalStyle
        }

        constructor() {
            super();
            this.$store.commit('setTitle', 'Getting Started')
            getGlobalEmail().then(v => {
                if (v)
                    this.$store.commit('updateGitConfig', {email: v})
            })
            getGlobalUsername().then(v => {
                if (v)
                    this.$store.commit('updateGitConfig', {name: v})
            })
        }

        @AsyncComputed()
        async gitConfigPath() {
            return await getGlobalConfigPath()
        }


        @AsyncComputed()
        async autoCollectedNameOrEmail() {
            return Boolean(await getGlobalUsername() || await getGlobalUsername())
        }

        @AsyncComputed()
        async fontsList() {
            return (await FontManager.findFonts({
                monospace: this.showMonospacedFontOnly
            })).map(e => e.family)
        }

        get selectedFontFamily() {
            return this.$store.state.config.UIStyle.globalStyle['font-family'] ?? 'Courier New'
        }

        set selectedFontFamily(v) {
            this.$store.commit('updateUIStyle', {
                target: 'global', style: {
                    'font-family': v
                }
            })
            this.$forceUpdate()
        }

        get selectedFontSize() {
            return this.$store.state.config.UIStyle.globalStyle['font-size'].slice(0, -2)
        }

        set selectedFontSize(v) {
            this.$store.commit('updateUIStyle', {
                target: 'global', style: {
                    'font-size': v + 'px'
                }
            })
            document.documentElement.style.fontSize = v + 'px' //update rem
        }

        get refs() {
            return this.$refs
        }

        get useDarkTheme() {
            return Number(this.$store.state.config.useDarkMode)
        }

        set useDarkTheme(v: number | boolean) {
            this.$store.commit('setDarkMode', Boolean(v))
            this.$vuetify.theme.dark = Boolean(v)
        }

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
            this.$store.commit('setWelcomeScreen',false)
            this.$store.state.config.save()
            initRepoAndCommitAll(configDirPath, 'Config Generated in Getting Started', true).then(
                _ => this.$router.push('/')
            ).catch(e => {
                showErrorWindow({
                    title: "Error",
                    message: 'Cannot create git repository',
                    detail: e.stack
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