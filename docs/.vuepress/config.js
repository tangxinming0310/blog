const headerConfig = require('./config/headerConfig')
const pluginsConfig = require('./config/pluginsConfig')
const navConfig = require('./config/navConfig')

module.exports = {
  base: '/blog/',
  title: '明天',
  description: '明日可期',
  head: headerConfig,
  plugins: pluginsConfig,
  themeConfig: {
    lastUpdated: '更新时间',
    nav: navConfig
  }
}