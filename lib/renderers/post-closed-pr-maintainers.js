module.exports = render

var u = require('unist-builder')

function render() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! This was closed. Team: If this was merged, please describe when this is likely to be released. Otherhwise, please add one of the '
      ),
      u('inlineCode', 'no/*'),
      u('text', ' labels.')
    ])
  ])
}
