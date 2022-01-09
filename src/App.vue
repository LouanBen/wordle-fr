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
</style>
