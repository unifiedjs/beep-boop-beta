module.exports = renderNoExternalMaintainers

var u = require('unist-builder')

function renderNoExternalMaintainers() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi team! Could you describe why this has been marked as external?'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
