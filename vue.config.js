var webpack = require('webpack')

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    proxy: process.env.VUE_APP_TITAN_URL,
    host: 'localhost'
  },
  pluginOptions: {
    electronBuilder: {
      externals: [
        'puppeteer',
        'puppeteer-extra',
        'puppeteer-extra-plugin-stealth'
      ],
      nodeModulesPath: ['../../node_modules', './node_modules'],
      nodeIntegration: true,
      builderOptions: {
        copyright: 'Copyright © 2021',
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        },
        publish: [
          {
            provider: 'github',
            repo: 'titan-bot-frontend',
            owner: 'dannielibor',
            token: process.env.VUE_APP_GITHUB_TOKEN,
            releaseType: 'draft',
            publishAutoUpdate: true,
            private: true
          }
        ]
      }
    }
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          PACKAGE_JSON: '"' + escape(JSON.stringify(require('./package.json'))) + '"'
        }
      })
    ],
    externals: {
      puppeteer: "require('puppeteer')",
      'puppeteer-extra': "require('puppeteer-extra')",
      'puppeteer-extra-plugin-stealth': "require('puppeteer-extra-plugin-stealth')"
    }
  }
}
