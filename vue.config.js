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
            repo: 'testing',
            owner: 'dannielibor',
            // token: '6e1be45365d30aa19d564cf983d776f6224e2ff9',
            releaseType: 'draft',
            publishAutoUpdate: true
            // private: true
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
