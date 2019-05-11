module.exports = {
    chainWebpack: config => {
        config.module
          .rule('firebase')
          .test(/firebase-config\.json$/)
          .use('firebase-config')
              .loader('./firebase-config-loader')
    },
    pages: {
        index: {
            entry: 'src/main.js', // エントリーポイントとなるjs
            template: 'public/index.html', // テンプレートのHTML
            filename: 'index.html' // build時に出力されるファイル名
        },
        subscreen: {
            entry: 'src/subscreen/main.js',
            template: 'public/subscreen.html',
            filename: 'subscreen/index.html'
        }
    }
}
