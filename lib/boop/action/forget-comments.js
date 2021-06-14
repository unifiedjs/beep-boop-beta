import fetch from 'node-fetch'
import {comments as setupComments} from '../setup/comments.js'
import {commentPragma} from '../util/comment-pragma.js'

export async function forgetComments(ctx, event, id) {
  const {endpoint, headers} = ctx
  const pragma = commentPragma(id)
  let query
  let index

  await setupComments(ctx, event)

  const comments = ctx.data.comments.filter(
    (d) => d.viewerDidAuthor && d.body.includes(pragma)
  )

  index = -1

  while (++index < comments.length) {
    comments[index].body = comments[index].body.replace(pragma, '')
  }

  if (comments.length > 0) {
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
