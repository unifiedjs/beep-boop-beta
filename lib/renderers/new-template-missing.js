import {u} from 'unist-builder'

export function newTemplateMissing(ctx, event) {
  const {data} = ctx
  const {post} = event
  const {type} = post
  const templates = Object.keys(data.templatesByName)
    .map((d) => data.templatesByName[d])
    .filter((d) => d.type === type)

  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! It seems you removed the template which we require. Here are our templates (pick the one you want to use and click *raw* to see its source):'
      )
    ]),
    u(
      'list',
      {spread: false},
      templates.map((d) =>
        u('listItem', {spread: false}, [
          u('paragraph', [
            u('link', {url: d.file.url}, [u('inlineCode', d.file.basename)])
          ])
        ])
      )
    ),
    u('paragraph', [
      u(
        'text',
        'I won’t send you any further notifications about this, but I’ll keep on updating this comment, and hide it when done!'
      )
    ]),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}
