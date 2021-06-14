import fetch from 'node-fetch'
import {comments as setupComments} from '../setup/comments.js'
import {commentPragma} from '../util/comment-pragma.js'

export async function unminimizeComments(ctx, event, id) {
  const {endpoint, headers} = ctx
  const pragma = commentPragma(id)
  let query
  let index

  await setupComments(ctx, event)

  const comments = ctx.data.comments.filter(
    (d) => d.viewerDidAuthor && d.isMinimized && d.body.includes(pragma)
  )

  if (comments.length > 0) {
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
