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
            token: '03c59d13a882d93d7a8f50772e1944791d46eb8e',
            releaseType: 'draft',
            publishAutoUpdate: true,
            private: true
          }
        ]
      }
    }
  }
}
