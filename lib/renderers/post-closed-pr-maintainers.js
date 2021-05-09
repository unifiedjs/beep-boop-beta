module.exports = render

var u = require('unist-builder')

function render() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! This was closed. Team: If this was merged, please discuss when this should be released. Oterhwise, please add one of the '
      ),
      u('inlineCode', 'no/*'),
      u('text', ' labels.')
    ])
  ])
}
