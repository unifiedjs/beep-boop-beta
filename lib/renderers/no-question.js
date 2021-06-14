import {u} from 'unist-builder'

const backlog =
  'https://en.wikipedia.org/wiki/Scrum_(software_development)#Product_backlog'
const support = 'https://github.com/unifiedjs/.github/blob/main/support.md'

export function noQuestion(ctx, event) {
  const {post} = event
  const {type} = post
  const kind = type === 'pr' ? 'pull request' : 'issue'

  // To do: dynamic support based on the repo / org?

  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! Thanks for reaching out! Because we treat ' + kind + 's as our '
      ),
      u('link', {url: backlog}, [u('text', 'backlog')]),
      u(
        'text',
        ', we close ' +
          kind +
          's that are questions since they don’t represent a task to be completed.'
      )
    ]),
    u('paragraph', [
      u('text', 'See our '),
      u('link', {url: support}, [u('text', 'support docs')]),
      u('text', ' for how and where to ask questions.')
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
