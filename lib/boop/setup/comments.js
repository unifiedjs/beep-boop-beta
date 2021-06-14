import fetch from 'node-fetch'

export async function comments(ctx, event) {
  const {data, endpoint, headers} = ctx
  const {post, owner, repo} = event
  const {number} = post

  // Already set up.
  if (data.comments) {
    return
  }

  // To do: Paginate.
  const result = await fetch(endpoint, {
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
