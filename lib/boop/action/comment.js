import fetch from 'node-fetch'
import {comments as setupComments} from '../setup/comments.js'
import {commentPragma} from '../util/comment-pragma.js'
import {render} from '../util/render.js'

export async function comment(ctx, event, value) {
  var {data, endpoint, headers} = ctx
  var {post} = event
  var {id} = post
  var [templateId, rest] = value.split(',').map((d) => d.trim())
  var templateName = rest || templateId
  var pragma = commentPragma(templateId)
  var comments
  var index
  var comment
  var body
  var result

  await setupComments(ctx, event)

  comments = data.comments
  index = comments.length

  while (index--) {
    if (
      comments[index].viewerDidAuthor &&
      comments[index].body.includes(pragma)
    ) {
      comment = comments[index]
      break
    }
  }

  body = await render(ctx, event, templateName)
  body += '\n' + pragma

  // Either update the existing comment, or add a new one.
  result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: comment
        ? `
        mutation($body: String!, $commentId: ID!) {
          updateIssueComment(input: { body: $body, id: $commentId }) { issueComment { id } }
        }
      `
        : `
        mutation($body: String!, $id: ID!) {
          addComment(input: { body: $body, subjectId: $id }) { commentEdge { node { id } } }
        }
      `,
      variables: {body, commentId: comment && comment.id, id}
    }),
    headers
  }).then((d) => d.json())

  if (comment) {
    comment.body = body
    console.info('Comment `' + templateId + '` edited')
  } else if (!result.data.addComment || !result.data.addComment.commentEdge) {
    // <https://github.com/unifiedjs/beep-boop-beta/issues/5>
    console.log()
    console.log('data:', result.data)
    console.log('post:', post)
    console.log('id:', id)
    console.log('body:', body)
    throw new Error('Could not post comment `' + templateId + '`')
  } else {
    comments.push({
      body,
      id: result.data.addComment.commentEdge.node.id,
      isMinimized: false,
      viewerDidAuthor: true
    })
    console.info('Comment `' + templateId + '` posted')
  }

  // To do: emit event.
}
