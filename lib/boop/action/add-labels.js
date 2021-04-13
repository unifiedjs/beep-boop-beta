module.exports = addLabels

var fetch = require('node-fetch')
var matches = require('../util/label-matches')

async function addLabels(ctx, event, expression) {
  var {endpoint, headers} = ctx
  var {owner, repo, post} = event
  var {id, number} = post
  var repoLabels
  var postLabels
  var result
  var data
  var matching

  // To do: paginate.
  result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            labels(first: 100) { nodes { id name } }
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

  data = (result && result.data && result.data.repository) || {}

  repoLabels = (data.labels && data.labels.nodes) || []
  postLabels =
    (data.issueOrPullRequest &&
      data.issueOrPullRequest.labels &&
      data.issueOrPullRequest.labels.nodes) ||
    []

  if (!repoLabels.length) {
    console.info('Could not find any labels in %s/%s', owner.name, repo.name)
    return
  }

  matching = repoLabels.filter(
    (x) => matches(x, expression) && !postLabels.some((y) => x.id === y.id)
  )

  if (matching.length) {
    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        query: `
          mutation($id: ID!, $ids: [ID!]!) {
            addLabelsToLabelable(input: { labelableId: $id, labelIds: $ids }) { clientMutationId }
          }
        `,
        variables: {id, ids: matching.map((d) => d.id)}
      }),
      headers
    }).then((d) => d.json())

    console.info(
      'Labeled %s w/ `%s` (`%j`)',
      number,
      expression,
      matching.map((d) => d.name)
    )

    // Emit new events.
    await Promise.all(
      matching.map((label) =>
        ctx.run(ctx, {
          ...event,
          eventName: 'labeled',
          label: {type: 'label', name: label.name, id: label.id}
        })
      )
    )
  } else {
    console.info(
      'Could not find labels on %s matching `%s` (or already applied)',
      number,
      expression
    )
  }
}
