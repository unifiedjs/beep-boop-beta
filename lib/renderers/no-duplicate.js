module.exports = renderNoDuplicate

var u = require('unist-builder')

var backlog =
  'https://en.wikipedia.org/wiki/Scrum_(software_development)#Product_backlog'

function renderNoDuplicate(ctx, event) {
  var {post} = event
  var {type} = post
  var kind = type === 'pr' ? 'pull request' : 'issue'

  return u('root', [
    u('paragraph', [
      u('text', 'Hi! Thanks for taking the time to contribute!')
    ]),
    u('paragraph', [
      u('text', 'Because we treat ' + kind + 's as our '),
      u('link', {url: backlog}, [u('text', 'backlog')]),
      u(
        'text',
        ', we close duplicates to focus our work and not have to touch the same chunk of code for the same reason multiple times. This is also why we may mark something as duplicate that isn’t an exact duplicate but is closely related.'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
