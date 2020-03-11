module.exports = {
  chainWebpack: config => {
    config.module.rule('images').uses.clear()
    config.module.rule('svg').uses.clear()
    config.module
      .rule('images')
      .test(/\.(png|jpe?g|gif|web|svg)(\?.*)?$/)
      .use('url-loader')
      .loader('url-loader')
      .tap(options => {
        return {
          ...options,
          limit: 10240
        }
      })

    config
      .plugin('html')
      .tap((args) => {
        args[0].title = '搜口罩'
        return args
      })
  }
}
