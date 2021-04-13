'use strict'

module.exports = run

var boop = require('../boop')

async function run(ctx, event) {
  var index = -1
  var task

  while (++index < ctx.tasks.length) {
    task = ctx.tasks[index]

    if (typeof task !== 'object') {
      throw new Error('Cannot handle main task: `' + JSON.stringify(task) + '`')
    }

    if (typeof task.if !== 'string') {
      throw new Error(
        'Cannot handle main task w/o `if`: `' + JSON.stringify(task) + '`'
      )
    }

    await performAction(ctx, event, task)
  }
}

async function performAction(ctx, event, task) {
  var index = -1

  if (typeof task === 'string') {
    return call(ctx, event, task, 'action')
  }

  if (typeof task !== 'object') {
    throw new Error('Cannot handle task: `' + JSON.stringify(task) + '`')
  }

  if (Array.isArray(task)) {
    while (++index < task.length) {
      await performAction(ctx, event, task[index])
    }
  } else if (task.then) {
    if (
      (!task.if || (await call(ctx, event, task.if, 'condition'))) &&
      (!task['if-not'] ||
        !(await call(ctx, event, task['if-not'], 'condition')))
    ) {
      return performAction(ctx, event, task.then)
    }
  } else {
    throw new Error(
      'Cannot handle task w/o `then`: `' + JSON.stringify(task) + '`'
    )
  }
}

function call(ctx, event, thing, type) {
  var position = thing.indexOf(':')
  var name
  var plugin
  var rest
  var todo
  var parameter

  if (position !== -1) {
    name = thing.slice(0, position)
    plugin = ctx.plugins.find((d) => d.name === name)
  }

  if (plugin) {
    rest = thing.slice(position + 1)
  } else {
    rest = thing
    plugin = boop
  }

  if (typeof plugin !== 'object') {
    throw new Error('Plugin `' + name + '` not registered')
  }

  if (typeof plugin[type] !== 'object') {
    throw new Error('Plugin `' + plugin.name + '` doesn’t have ' + type + 's')
  }

  position = rest.indexOf(':')

  if (position === -1) {
    todo = rest
  } else {
    todo = rest.slice(0, position)
    parameter = rest.slice(position + 1)
  }

  if (typeof plugin[type][todo] !== 'function') {
    throw new Error(
      'Plugin `' + name + '` doesn’t have a `' + todo + '` ' + type
    )
  }

  return plugin[type][todo](ctx, event, parameter)
}
