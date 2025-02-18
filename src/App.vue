<template>
  <div id="app">
    <PromoBookClassic v-if="onBookClassic" @goBackToGame="onBookClassic = false"/>
    <Game v-else @goToBookClassic="onBookClassic = true"/>
  </div>
</template>

<script>
import Game from './components/Game.vue';
import PromoBookClassic from './components/PromoBookClassic.vue';

export default {
  name: 'App',
  components: {
    Game,
    PromoBookClassic,
  },
  data() {
    return {
      onBookClassic: false,
    }
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
// Begin reset.css

html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video
    margin: 0
    padding: 0
    border: 0
    font-size: 100%
    font: inherit
    vertical-align: baseline
/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section
    display: block
body
    line-height: 1
ol,
ul
    list-style: none
blockquote,
q
    quotes: none
blockquote:before,
blockquote:after,
q:before,
q:after
    content: ''
    content: none
table
    border-collapse: collapse
    border-spacing: 0
/* apply a natural box layout model to all elements */
*,
*::before,
*::after,
*:before,
*:after
    -moz-box-sizing: border-box
    -webkit-box-sizing: border-box
    box-sizing: border-box
/* inputs */
input,
button,
textarea,
select
    color: inherit
    font-size: inherit
    font-style: inherit
    font-family: inherit
    -webkit-border-radius: 0
    border-radius: 0
    -webkit-padding-start: 0
    align-items: flex-start
    text-index: 0
    border: none
    outline: none
    background: none
    padding: 0
    margin: 0
    width: auto
    height: auto
    line-height: 1em
/* inputs appearance (not for every input)  */
input[type='text'],
input[type='reset'],
input[type='password'],
input[type='search'],
input[type='email'],
input[type='tel'],
input[type='url'],
input[type='time'],
input[type='week'],
input[type='month'],
input[type='date'],
input[type='datetime'],
input[type='datetime-local'],
input[type='number'],
input[type='submit'],
input[type='reset'],
input[type='color'],
input[type='file'],
button,
textarea,
select
    height: 1em
    -webkit-appearance: none
    -moz-appearance: none
    appearance: none
/* input color width */
input[type='color']
    width: 1em
/* IE clear cross */
input::-ms-clear
    display: none
/* details and summary */
details,
summary
    -webkit-appearance: none
    -moz-appearance: none
    appearance: none
/* text size adjusting */
body
    -webkit-text-size-adjust: 100%
    -moz-text-size-adjust: 100%
    text-size-adjust: 100%
/* mark */
mark
    background: none
/* Font smoothing */
*,
*::before,
*::after,
*:before,
*:after
    -webkit-font-smoothing: antialiased
    -moz-osx-font-smoothing: grayscale
hr
    height: 1px
    margin: 0
    padding: 0
u
    text-decoration: none
table th
    text-align: left
/* a */
a,
a:link,
a:visited,
a:focus,
a:active
  color: inherit
  outline: none
  text-decoration: none
a:hover
  outline: none
  text-decoration: none

// End reset.css

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
  background: #0E0E0F
  width: 100vw
  height: 100%
  display: flex
  justify-content: center
  touch-action: manipulation
</style>
