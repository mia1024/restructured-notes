import Vue from "vue"
import App from "./App.vue"
import vuetify from '../plugins/vuetify'
import store from './store'
import './index.scss'
import '@mdi/font/scss/materialdesignicons.scss'

if (module.hot) {
  module.hot.accept();
}



new Vue({
    vuetify,
    store,
	render: h=>h(App),
}).$mount('#app')

