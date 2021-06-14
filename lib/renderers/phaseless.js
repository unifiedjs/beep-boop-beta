import u from 'unist-builder'

export function phaseless() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi team! I don’t know what’s up as there’s no phase label. Please add one so I know where it’s at.'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
