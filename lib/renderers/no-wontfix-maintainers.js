import u from 'unist-builder'

export function noWontfixMaintainers() {
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
