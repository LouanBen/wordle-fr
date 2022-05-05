const fs = require('fs');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const webpack = require('webpack');

const currentYear = new Date().getFullYear();

if (!process.env.BUILD_ID && process.env.NODE_ENV === 'development')
process.env.BUILD_ID = 'development';

process.env.VUE_APP_BUILD_ID = process.env.BUILD_ID;
fs.writeFileSync('public/build_id.json', JSON.stringify({
  BUILD_ID: process.env.BUILD_ID
}));

module.exports = {
  configureWebpack: {
    plugins: [
      // On ne s'intéresse qu'à la timezone de Paris
      new MomentTimezoneDataPlugin({
        matchZones: /(CET|CEST|Paris)$/,
        startYear: currentYear - 1,
        endYear: currentYear + 5,
    }),
      // Et on n'a pas besoin des autres langues de momentjs
      new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /fr/),
    ]
  }
};