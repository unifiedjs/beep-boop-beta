import {u} from 'unist-builder'

export function openNeedsRepro() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! Thanks for taking the time to contribute! This has been marked by a maintainer as needing a reproduction: It’s not yet clear whether this is a problem. Here are a couple tips:'
      )
    ]),
    u('list', {spread: false}, [
      u('listItem', {spread: false}, [
        u('paragraph', [
          u(
            'text',
            'Thoroughly document how to reproduce the problem, in steps or with code'
          )
        ])
      ]),
      u('listItem', {spread: false}, [
        u('paragraph', [
          u(
            'text',
            'Don’t link to your complete project: make the repro as tiny as possible, preferrably with only the problematic project in question'
          )
        ])
      ]),
      u('listItem', {spread: false}, [
        u('paragraph', [
          u(
            'text',
            'Make sure you’re on the latest versions of projects (and node/npm/yarn!)'
          )
        ])
      ]),
      u('listItem', {spread: false}, [
        u('paragraph', [
          u('text', 'The best issue report is a failing test proving it')
        ])
      ])
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
