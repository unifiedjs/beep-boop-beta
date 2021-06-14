import fetch from 'node-fetch'

export async function comments(ctx, event) {
  var {data, endpoint, headers} = ctx
  var {post, owner, repo} = event
  var {number} = post
  var result

  // Already set up.
  if (data.comments) {
    return
  }

  // To do: Paginate.
  result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue { comments(first: 100) { nodes { body id isMinimized viewerDidAuthor } } }
              ... on PullRequest { comments(first: 100) { nodes { body id isMinimized viewerDidAuthor } } }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())

  data.comments =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.comments &&
      result.data.repository.issueOrPullRequest.comments.nodes) ||
    []
}
