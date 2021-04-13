module.exports = renderNewTemplateCheck

var u = require('unist-builder')
var encode = require('stringify-entities/light')

function renderNewTemplateCheck(ctx) {
  var {data} = ctx
  var template = data.templatesByName[data.checkTemplateName]

  if (data.checkTemplateChecks === undefined) {
    throw new Error(
      'Template rendered but not checked: please use an `if: check-template:...` condition before'
    )
  }

  return u('root', [
    u('paragraph', [
      u(
        'text',
        'Hi! It seems some of the things asked in the template are missing? Please edit your post to fill out everything.'
      )
    ]),
    u(
      'list',
      {spread: false},
      data.checkTemplateChecks.map((d) =>
        u('listItem', {spread: false, checked: Boolean(d.ok)}, [
          u('paragraph', [
            u('text', d.section),
            u(
              'text',
              d.ok ? '' : ' (' + (d.ok === null ? 'missing' : 'todo') + ')'
            )
          ])
        ])
      )
    ),
    u('paragraph', [
      u(
        'text',
        'You won’t get any more notifications from me, but I’ll keep on updating this comment, and remove it when done!'
      )
    ]),
    u(
      'html',
      '<details><summary>If you need it, here’s the <a href="' +
        encode(template.file.url, {escapeOnly: true}) +
        '">original template</a></summary>'
    ),
    u('code', {lang: 'markdown'}, template.file.contents),
    u('html', '</details>'),
    u('paragraph', [u('text', 'Thanks,\n— bb')])
  ])
}