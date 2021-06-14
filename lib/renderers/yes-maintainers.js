import u from 'unist-builder'

export function yesMaintainers(ctx, event) {
  var {post} = event
  var {type} = post
  var kind = type === 'pr' ? 'pull request' : 'issue'

  return kind === 'issue'
    ? u('root', [
        u('paragraph', [
          u(
            'text',
            'Hi! This was marked as ready to be worked on! Note that while this is ready to be worked on, nothing is said about priority: it may take a while for this to be solved.'
          )
        ]),
        u('paragraph', [
          u('text', 'Is this something you can and want to work on?')
        ]),
        u('paragraph', [
          u('text', 'Team: please use the '),
          u('inlineCode', 'area/*'),
          u('text', ' (to describe the scope of the change), '),
          u('inlineCode', 'platform/*'),
          u('text', ' (if this is related to a specific one), and '),
          u('inlineCode', 'semver/*'),
          u('text', ' and '),
          u('inlineCode', 'type/*'),
          u(
            'text',
            ' labels to annotate this. If this is first-timers friendly, add '
          ),
          u('inlineCode', 'good first issue'),
          u('text', ' and if this could use help, add '),
          u('inlineCode', 'help wanted'),
          u('text', '.')
        ])
      ])
    : u('root', [
        u('paragraph', [
          u('text', 'Hi! This is accepted and can go somewhere!')
        ]),
        u('paragraph', [
          u('text', 'Team: please review this PR and use the '),
          u('inlineCode', 'area/*'),
          u('text', ' (to describe the scope of the change), '),
          u('inlineCode', 'platform/*'),
          u('text', ' (if this is related to a specific one), and '),
          u('inlineCode', 'semver/*'),
          u('text', ' and '),
          u('inlineCode', 'type/*'),
          u('text', ' labels to annotate this.')
        ])
      ])
}
