'use strict'

module.exports = beep

var github = require('@actions/github')
var core = require('@actions/core')
var run = require('./run.js')

var posts = ['issues', 'pull_request']

var postActions = [
  'opened',
  'reopened',
  'edited',
  'closed',
  'labeled',
  'unlabeled'
]

function beep(options) {
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
  var token = core.getInput('repo-token', {required: true})

  if (!token) {
    throw new Error('Missing `token`')
  }

  return run(
    {
      run: run,
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
  var {eventName, payload} = context
  var {action, label, repository} = payload
  var post = payload.issue || payload.pull_request

  if (!posts.includes(eventName)) {
    throw new Error('Can’t handle GH action event name `' + eventName + '`')
  }

  if (!postActions.includes(action)) {
    throw new Error('Can’t handle GH action `' + action + '`')
  }

  console.log('!', payload);
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
