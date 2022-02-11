import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

// If the browser supports service workers
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // We register it after the page is loaded
    navigator.serviceWorker.register('/sw.js')
  })
}
