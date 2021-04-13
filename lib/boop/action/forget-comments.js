module.exports = forgetComments

var fetch = require('node-fetch')
var setupComments = require('../setup/comments')
var commentPragma = require('../util/comment-pragma')

async function forgetComments(ctx, event, id) {
  var {endpoint, headers} = ctx
  var pragma = commentPragma(id)
  var comments
  var query
  var index

  await setupComments(ctx, event)

  comments = ctx.data.comments.filter(
    (d) => d.viewerDidAuthor && d.body.includes(pragma)
  )

  index = -1

  while (++index < comments.length) {
    comments[index].body = comments[index].body.replace(pragma, '')
  }

  if (comments.length) {
    query = [
      'mutation {',
      ...comments.map(
        (d, i) =>
          `  u${i}: updateIssueComment(input: { body: ${JSON.stringify(
            d.body
          )}, id: ${JSON.stringify(d.id)} }) { clientMutationId }`
      ),
      '}'
    ].join('\n')

    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({query}),
      headers
    }).then((d) => d.json())
    // To do: emit event.

    console.info('Forgot comments for `' + id + '`')
  } else {
    console.info('Could not find comments to forget for `' + id + '`')
  }
}
