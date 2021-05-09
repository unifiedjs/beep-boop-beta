module.exports = render

var u = require('unist-builder')

function render() {
  return u('root', [
    u('paragraph', [
      u('text', 'Hi! This was closed. Team: If this was fixed, please add '),
      u('inlineCode', 'phase/solved'),
      u('text', '. Otherwise, please add one of the '),
      u('inlineCode', 'no/*'),
      u('text', ' labels.')
    ])
  ])
}
