import u from 'unist-builder'

export function noExternalMaintainers() {
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
