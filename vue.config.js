const fs = require('fs')

process.env.VUE_APP_BUILD_ID = process.env.BUILD_ID
fs.writeFileSync('public/build_id.json', JSON.stringify({
    BUILD_ID: process.env.BUILD_ID
}))

module.exports = {

}