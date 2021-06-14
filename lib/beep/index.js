import github from '@actions/github'
import core from '@actions/core'
import {run} from './run.js'

const posts = new Set(['issues', 'pull_request', 'pull_request_target'])

const postActions = new Set([
  'opened',
  'reopened',
  'edited',
  'closed',
  'labeled',
  'unlabeled'
])

export function beep(options) {
  try {
    go(options).then(() => {}, onerror)
  } catch (error) {
    onerror(error)
  }
}

function onerror(error) {
  console.error(String(error.stack))
  core.setFailed(error.message)
}

function go(options) {
  const token = core.getInput('repo-token', {required: true})

  if (!token) {
    throw new Error('Missing `token`')
  }

  return run(
    {
      run,
      plugins: options.plugins || [],
      renderers: options.renderers || {},
      tasks: options.tasks || [],
      data: {},
      endpoint: 'https://api.github.com/graphql',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'bearer ' + token
      }
    },
    toEvent(github.context)
  )
}

// Turn a GH context into an event.
function toEvent(context) {
  const {eventName, payload} = context
  const {action, label, repository} = payload
  const post = payload.issue || payload.pull_request

  if (!posts.has(eventName)) {
    throw new Error('Can’t handle GH action event name `' + eventName + '`')
  }

  if (!postActions.has(action)) {
    throw new Error('Can’t handle GH action `' + action + '`')
  }

  return {
    eventSource: 'post',
    eventName: action,
    owner: {
      type: repository.owner.type === 'User' ? 'user' : 'org',
      name: repository.owner.login,
      id: repository.owner.node_id
    },
    repo: {
      type: 'repo',
      name: repository.name,
      id: repository.node_id
    },
    post: post
      ? {
          type: payload.pull_request ? 'pr' : 'issue',
          number: post.number,
          id: post.node_id
        }
      : null,
    label: label ? {type: 'label', name: label.name, id: label.node_id} : null
  }
}
