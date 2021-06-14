import {boop} from '../boop/index.js'

export async function run(ctx, event) {
  let index = -1
  let task

  while (++index < ctx.tasks.length) {
    task = ctx.tasks[index]

    if (typeof task !== 'object') {
      throw new TypeError(
        'Cannot handle main task: `' + JSON.stringify(task) + '`'
      )
    }

    if (typeof task.if !== 'string') {
      throw new TypeError(
        'Cannot handle main task w/o `if`: `' + JSON.stringify(task) + '`'
      )
    }

    await performAction(ctx, event, task)
  }
}

async function performAction(ctx, event, task) {
  let index = -1

  if (typeof task === 'string') {
    return call(ctx, event, task, 'action')
  }

  if (typeof task !== 'object') {
    throw new TypeError('Cannot handle task: `' + JSON.stringify(task) + '`')
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
  let position = thing.indexOf(':')
  let name
  let plugin
  let rest
  let todo
  let parameter

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
    throw new TypeError('Plugin `' + name + '` not registered')
  }

  if (typeof plugin[type] !== 'object') {
    throw new TypeError(
      'Plugin `' + plugin.name + '` doesn’t have ' + type + 's'
    )
  }

  position = rest.indexOf(':')

  if (position === -1) {
    todo = rest
  } else {
    todo = rest.slice(0, position)
    parameter = rest.slice(position + 1)
  }

  if (typeof plugin[type][todo] !== 'function') {
    throw new TypeError(
      'Plugin `' + name + '` doesn’t have a `' + todo + '` ' + type
    )
  }

  return plugin[type][todo](ctx, event, parameter)
}
