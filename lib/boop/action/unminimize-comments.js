module.exports = unminimizeComment

var fetch = require('node-fetch')
var setupComments = require('../setup/comments')
var commentPragma = require('../util/comment-pragma')

async function unminimizeComment(ctx, event, id) {
  var {endpoint, headers} = ctx
  var pragma = commentPragma(id)
  var comments
  var query
  var index

  await setupComments(ctx, event)

  comments = ctx.data.comments.filter(
    (d) => d.viewerDidAuthor && d.isMinimized && d.body.includes(pragma)
  )

  if (comments.length) {
    query = [
      'mutation {',
      ...comments.map(
        (d, i) =>
          `  u${i}: unminimizeComment(input: { subjectId: ${JSON.stringify(
            d.id
          )} }) { clientMutationId }`
      ),
      '}'
    ].join('\n')

    // To do: make `classifier` configurable.
    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({query}),
      headers
    }).then((d) => d.json())

    index = -1

    while (++index < comments.length) {
      comments[index].isMinimized = true
    }

    console.info('Unminimized comments for `' + id + '`')
  } else {
    console.info('Could not find comments to unminimize for `' + id + '`')
  }

  // To do: emit event.
}
