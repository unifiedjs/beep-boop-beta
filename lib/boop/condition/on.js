// Note: we’re only supporting posts right now.
import {labelMatches} from '../util/label-matches.js'

var own = {}.hasOwnProperty

var map = {
  'post-closed': postClosed,
  'post-edited': postEdited,
  'post-labeled': postLabeled,
  'post-opened': postOpened,
  'post-reopened': postReopened,
  'post-unlabeled': postUnlabeled
}

export function on(ctx, event, parameters) {
  var keys = parameters.split(':')
  var key = keys.shift()

  if (!own.call(map, key)) {
    throw new Error('Unknown `' + key + '` as `on` condition')
  }

  return map[key](ctx, event, ...keys)
}

function postClosed(ctx, event) {
  return event.eventName === 'closed'
}

function postEdited(ctx, event) {
  return event.eventName === 'edited'
}

function postLabeled(ctx, event, expression) {
  return event.eventName === 'labeled' && labelMatches(event.label, expression)
}

function postOpened(ctx, event) {
  return event.eventName === 'opened'
}

function postReopened(ctx, event) {
  return event.eventName === 'reopened'
}

function postUnlabeled(ctx, event, expression) {
  return (
    event.eventName === 'unlabeled' && labelMatches(event.label, expression)
  )
}
