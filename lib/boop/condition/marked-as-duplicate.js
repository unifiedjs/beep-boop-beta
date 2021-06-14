import fetch from 'node-fetch'

export async function markedAsDuplicate(ctx, event) {
  const {endpoint, headers} = ctx
  const {owner, repo, post} = event
  const {number} = post

  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue {
                timelineItems(last: 1, itemTypes: [MARKED_AS_DUPLICATE_EVENT, UNMARKED_AS_DUPLICATE_EVENT]) { nodes { __typename } }
              }
              ... on PullRequest {
                timelineItems(last: 1, itemTypes: [MARKED_AS_DUPLICATE_EVENT, UNMARKED_AS_DUPLICATE_EVENT]) { nodes { __typename } }
              }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())

  const events =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.timelineItems &&
      result.data.repository.issueOrPullRequest.timelineItems.nodes) ||
    []

  return (
    events[events.length - 1] &&
    events[events.length - 1].__typename === 'MarkedAsDuplicateEvent'
  )
}
