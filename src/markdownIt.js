const markdownIt = require('markdown-it')({ html: true })
  .use(require('markdown-it-emoji'))
  .use(require('markdown-it-sanitizer'))
  .use(require('markdown-it-imsize'))
  .use(require('markdown-it-link-attributes'), {
    attrs: {
      target: '_blank',
      rel: 'noopener noreferrer'
    }
  })

export default markdownIt
