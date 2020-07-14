import VueRouter from "vue-router";
import Vue from "vue"
import {App, GettingStarted, NotFound} from '@components'
// @ts-ignore: TS7016
import VueRouterReferer from '@tozd/vue-router-referer'

const router=new VueRouter(
    {
        //mode:'history',
        routes:[
            {path:'/',component:App},
            {path: '/getting-started',component: GettingStarted},
            {path:'*',component: NotFound}
        ]
    }
)

Vue.use(VueRouter,VueRouterReferer)

export default router