module.exports = hasLabels

var fetch = require('node-fetch')
var matches = require('../util/label-matches')

async function hasLabels(ctx, event, expression) {
  var {endpoint, headers} = ctx
  var {owner, repo, post} = event
  var {number} = post
  var labels

  // To do: paginate.
  var result = await fetch(endpoint, {
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

  labels =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.labels &&
      result.data.repository.issueOrPullRequest.labels.nodes) ||
    []

  return labels.some((d) => matches(d, expression))
}
