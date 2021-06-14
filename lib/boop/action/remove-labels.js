import fetch from 'node-fetch'
import {labelMatches} from '../util/label-matches.js'

export async function removeLabels(ctx, event, expression) {
  var {endpoint, headers} = ctx
  var {owner, repo, post} = event
  var {id, number} = post
  var matching
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

  if (!labels.length) {
    console.info('Could not find any labels on %s', number)
    return
  }

  matching = labels.filter((d) => labelMatches(d, expression))

  if (matching.length) {
    await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        query: `
          mutation($id: ID!, $ids: [ID!]!) {
            removeLabelsFromLabelable(input: { labelableId: $id, labelIds: $ids }) { clientMutationId }
          }
        `,
        variables: {id, ids: matching.map((d) => d.id)}
      }),
      headers
    }).then((d) => d.json())

    console.info(
      'Unlabeled %s: `%s` (`%j`)',
      number,
      expression,
      matching.map((d) => d.name)
    )

    // Emit new events.
    await Promise.all(
      matching.map((label) =>
        ctx.run(ctx, {
          ...event,
          eventName: 'unlabeled',
          label: {type: 'label', name: label.name, id: label.id}
        })
      )
    )
  } else {
    console.info(
      'Could not find labels on %s matching `%s`',
      number,
      expression
    )
  }
}
