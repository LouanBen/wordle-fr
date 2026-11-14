import Vue from 'vue'
import App from './App.vue'
import { inDiscord, initDiscord } from './discord'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

initDiscord()

// If the browser supports service workers (not inside Discord, which serves the app through its proxy)
if ('serviceWorker' in navigator && !inDiscord) {
  window.addEventListener('load', () => {
    // We register it after the page is loaded
    navigator.serviceWorker.register('/sw.js')
  })
}
