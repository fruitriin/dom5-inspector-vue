import Vue from 'vue'
import './plugins/axios'
import App from './App.vue'
import router from './router'
import _ from 'lodash'

Vue.config.productionTip = false

new Vue({
  router,
  _,
  render: h => h(App)
}).$mount('#app')
