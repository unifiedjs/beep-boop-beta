import u from 'unist-builder'

export function postClosedPrMaintainers() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! This was closed. Team: If this was merged, please describe when this is likely to be released. Otherwise, please add one of the '
      ),
      u('inlineCode', 'no/*'),
      u('text', ' labels.')
    ])
  ])
}
