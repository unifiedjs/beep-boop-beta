module.exports = renderOpenNeedsInfo

var u = require('unist-builder')

var duck = 'https://rubberduckdebugging.com'
var xy =
  'https://meta.stackexchange.com/questions/66377/what-is-the-xy-problem/66378#66378'

function renderOpenNeedsInfo(ctx, event) {
  var {post} = event
  var {type} = post
  var kind = type === 'pr' ? 'pull request' : 'issue'

  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! Thanks for taking the time to contribute! This has been marked by a maintainer as needing more info. It’s not clear yet whether this is an issue. Here are a couple tips:'
      )
    ]),
    u('list', {spread: false}, [
      u('listItem', {spread: false}, [
        u('paragraph', [
          u(
            'text',
            'Spend time framing the ' +
              kind +
              '! The more time you put into it, the more we will'
          )
        ])
      ]),
      u('listItem', {spread: false}, [
        u('paragraph', [
          u('text', 'Often, maintainers respond with '),
          u('emphasis', [u('text', 'why')]),
          u('text', ' for several back and forths; '),
          u('link', {url: duck}, [u('text', 'rubber duck debugging')]),
          u('text', ' might help avoid that')
        ])
      ]),
      u('listItem', {spread: false}, [
        u('paragraph', [
          u('text', 'Folks posting issues sometimes fall for '),
          u('link', {url: xy}, [u('text', 'xy problems')]),
          u(
            'text',
            ': asking for a certain solution instead of raising the root problem'
          )
        ])
      ])
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
