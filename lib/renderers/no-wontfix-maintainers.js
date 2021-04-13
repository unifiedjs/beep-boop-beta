module.exports = renderNoWontfixMaintainers

var u = require('unist-builder')

function renderNoWontfixMaintainers() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi team! Could you describe why this has been marked as wontfix?'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
