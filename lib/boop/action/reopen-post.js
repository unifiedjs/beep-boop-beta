import fetch from 'node-fetch'

export async function reopenPost(ctx, event) {
  const {endpoint, headers} = ctx
  const {owner, repo, post} = event
  const {type, id, number} = post

  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue { id state }
              ... on PullRequest { id state }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())
  // To do: error handle.

  const data =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest) ||
    {}

  if (data.state === 'OPEN') {
    return console.info('Already open')
  }

  await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query:
        type === 'issue'
          ? `mutation($id: ID!) { openIssue(input: { issueId: $id }) { clientMutationId } }`
          : `mutation($id: ID!) { openPullRequest(input: { pullRequestId: $id }) { clientMutationId } }`,
      variables: {id}
    }),
    headers
  }).then((d) => d.json())
  // To do: error handle.

  console.info('Reopened %s', number)

  return ctx.run(ctx, {...event, eventName: 'reopened'})
}
