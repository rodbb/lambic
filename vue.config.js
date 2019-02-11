module.exports = {
    chainWebpack: config => {
        config.module
          .rule('firebase')
          .test(/firebase-config\.json$/)
          .use('firebase-config')
              .loader('./firebase-config-loader')
      }
    
}
