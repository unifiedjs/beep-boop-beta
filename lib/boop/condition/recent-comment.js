import ms from 'ms'
import fetch from 'node-fetch'

const own = {}.hasOwnProperty

const map = {
  TEAM: ['COLLABORATOR', 'MEMBER', 'OWNER'],
  NONTEAM: [
    'CONTRIBUTOR',
    'FIRST_TIMER',
    'FIRST_TIME_CONTRIBUTOR',
    'MANNEQUIN',
    'NONE'
  ]
}

map.ANY = map.TEAM.concat(map.NONTEAM)

export async function recentComment(ctx, event, value) {
  const {endpoint, headers} = ctx
  const {owner, repo, post} = event
  const {number} = post
  const parameters = (value || '').split(',')
  const role = (parameters[0] || 'any').toUpperCase()
  const time = ms(parameters[1] || '1m')
  const threshold = Date.now().valueOf() - time
  const roles = own.call(map, role) ? map[role] : [role]

  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue { comments(last: 50) { nodes { authorAssociation createdAt } } }
              ... on PullRequest { comments(last: 50) { nodes { authorAssociation createdAt } } }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())

  const comments =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.comments &&
      result.data.repository.issueOrPullRequest.comments.nodes) ||
    []

  return comments.some(
    (d) =>
      Number(new Date(d.createdAt)) > threshold &&
      roles.includes(d.authorAssociation)
  )
}
