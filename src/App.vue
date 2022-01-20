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
    let lastCacheCheck = 0;

    // Called whenever we need to reload the app, to reset cache before reloading.
    function resetCacheAndReload () {
      let xhr = new XMLHttpRequest;
      let loc = window.location;

      xhr.open('GET', loc.href.replace(loc.hash, ''));
      xhr.setRequestHeader("Cache-Control", "no-cache");
      xhr.onload = () => {
        loc.reload();
      }
      xhr.send();
    }

    // Called at mount, and when the window is focused after 1min+ since the last check
    function checkCache (onFocus = false) {
      if (onFocus && Date.now() - lastCacheCheck < 60000)
        return;

      let xhr = new XMLHttpRequest;
      xhr.open('GET', '/build_id.json');
      xhr.setRequestHeader("Cache-Control", "no-cache, no-store, max-age=0");
      xhr.onload = () => {
        lastCacheCheck = Date.now();

        let currBuildID = process.env.VUE_APP_BUILD_ID;
        let res = JSON.parse(xhr.responseText);
        if (res.BUILD_ID && currBuildID && currBuildID !== res.BUILD_ID) {
          resetCacheAndReload();
        }
      }
      xhr.send()
    }

    checkCache();
    window.addEventListener('focus', () => checkCache(true));
    
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
  font-family: Outfit, Avenir, Helvetica, Arial, sans-serif
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
