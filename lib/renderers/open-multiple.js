import u from 'unist-builder'

export function openMultiple(ctx, event) {
  var {post} = event
  var {type} = post
  var kind = type === 'pr' ? 'pull request' : 'issue'

  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! Thanks for taking the time to contribute! This has been marked by a maintainer as being several ' +
          kind +
          's. Could you bring this down to a single thing, so that we can discuss each separately?'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
