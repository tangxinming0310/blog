const moment = require('moment')
moment.locale('zh-cn')
module.exports = {
  base: '/blog/',
  title: '明天',
  description: '明日可期',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'author', content: 'bright' }],
    ['meta', { name: 'keywords', content: 'vuepress introduce' }]
  ],
  plugins: [
    [
      '@vuepress/last-updated',
      {
        transformer: (timestamp) => {
          return moment(timestamp).format('LLLL')
        }
      }
    ]
  ],
  themeConfig: {
    lastUpdated: '更新时间',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/about' },
      { text: 'css', link: '/css/' },
      { text: 'js', link: '/js/' },
      {
        text: 'Languages',
        items: [
          { text: 'Group1', items: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/about' }
          ] },
          { text: 'Group2', items: [
            { text: 'Home', link: '/' },
            { text: 'Guide', link: '/about' }
          ] }
        ]
      },
      { text: 'External', link: 'https://google.com' },
    ],
    sidebar: {
      '/css/': [
        '',
        'css1',
        'css2',
        'css3'
      ],
      '/js/': [
        '',
        'js1',
        'js2',
        'js3'
      ],
    }
  }
}