import Vue from "vue";
import './plugins/axios'
import App from "./App.vue";
import router from "./router";
window._ = require("lodash");

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");


