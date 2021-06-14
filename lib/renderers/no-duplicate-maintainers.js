import {u} from 'unist-builder'

const docs =
  'https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/about-duplicate-issues-and-pull-requests'

export function noDuplicateMaintainers() {
  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi team! It seems this post is a duplicate, but hasn’t been marked as such. Please post a comment w/ '
      ),
      u('inlineCode', 'Duplicate of #123'),
      u('text', '(no final '),
      u('inlineCode', '.'),
      u('text', ') to do so. See '),
      u('link', {url: docs}, [u('text', 'GH docs')]),
      u('text', ' for more info.')
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
