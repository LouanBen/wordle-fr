<template>
  <div id="app">
    <Game/>
  </div>
</template>

<script>
import Game from './components/Game.vue';

export default {
  name: 'App',
  components: {
    Game
  },
  mounted() {
    //let lastTime = Date.now()
    /*let interval
    
    const startInterval = () => {
      setInterval(() => {
        if (Date.now() - lastTime > 10000) {
          alert((Date.now() - lastTime)/1000)
        }
        lastTime = Date.now()
      }, 5000)
    }*/
    function checkCache () {
      let xhr = new XMLHttpRequest;
      xhr.open('GET', '/build_id.json');
      xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0")
      xhr.onload = () => {
        let res = JSON.parse(xhr.responseText)
        console.log('build-id-check', process.env.VUE_APP_BUILD_ID, res.BUILD_ID)
      }
      xhr.send()
    }
    
    checkCache()
    window.addEventListener('focus', checkCache)
    
    if(window.location.protocol != 'https:' && !/^(.*\.?localhost|127\.0\.0\.1|192\.168\.\d+\.\d+)$/.test(window.location.hostname)) {
      location.href = location.href.replace("http://", "https://");
    }
  }
}
</script>

<style lang="sass">
*
  margin: 0
html
  height: 100%
body
  height: 100%
#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #919191
  background: #121213
  width: 100vw
  height: 100%
  display: flex
  justify-content: center
  touch-action: manipulation
</style>
