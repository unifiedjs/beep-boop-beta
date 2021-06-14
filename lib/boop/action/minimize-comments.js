import fetch from 'node-fetch'
import {comments as setupComments} from '../setup/comments.js'
import {commentPragma} from '../util/comment-pragma.js'

export async function minimizeComments(ctx, event, id) {
  var {endpoint, headers} = ctx
  var pragma = commentPragma(id)
  var comments
  var query
  var index

  await setupComments(ctx, event)

  comments = ctx.data.comments.filter(
    (d) => d.viewerDidAuthor && !d.isMinimized && d.body.includes(pragma)
  )

  if (comments.length) {
    // To do: make `classifier` configurable.
    query = [
      'mutation {',
      ...comments.map(
        (d, i) =>
          `  m${i}: minimizeComment(input: { subjectId: ${JSON.stringify(
            d.id
          )}, classifier: RESOLVED }) { clientMutationId }`
      ),
      '}'
    ].join('\n')

    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({query}),
      headers
    }).then((d) => d.json())

    index = -1

    while (++index < comments.length) {
      comments[index].isMinimized = true
    }

    console.info('Minimized comments for `' + id + '`')
  } else {
    console.info('Could not find comments to minimize for `' + id + '`')
  }

  // To do: emit event.
}
