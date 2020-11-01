var webpack = require('webpack')

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: {
    proxy: process.env.VUE_APP_TITAN_URL
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true
        },
        publish: [
          {
            provider: 'github',
            repo: 'titan-bot-frontend',
            owner: 'dannielibor',
            token: 'a047d3768bb0723bed97d44a3eb0ea4ff51af3e3',
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
    ]
  }
}
// 03c59d13a882d93d7a8f50772e1944791d46eb8e
