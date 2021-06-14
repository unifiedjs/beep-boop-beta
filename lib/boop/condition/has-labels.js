import fetch from 'node-fetch'
import {labelMatches} from '../util/label-matches.js'

export async function hasLabels(ctx, event, expression) {
  const {endpoint, headers} = ctx
  const {owner, repo, post} = event
  const {number} = post

  // To do: paginate.
  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue { labels(first: 100) { nodes { id name } } }
              ... on PullRequest { labels(first: 100) { nodes { id name } } }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())

  const labels =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.labels &&
      result.data.repository.issueOrPullRequest.labels.nodes) ||
    []

  return labels.some((d) => labelMatches(d, expression))
}
