module.exports = render

var unified = require('unified')
var parse = require('remark-parse')
var stringify = require('remark-stringify')
var gfm = require('remark-gfm')

var processor = unified().use(parse).use(gfm).use(stringify)

var own = {}.hasOwnProperty

async function render(ctx, event, parameters) {
  var renderers = ctx.renderers
  var keys = parameters.split(':')
  var key = keys.shift()
  var result

  if (!own.call(renderers, key)) {
    throw new Error('Unregistered render function `' + key + '`')
  }

  result = renderers[key](ctx, event, ...keys)

  // Support mdast / string.
  return typeof result === 'object' ? processor.stringify(result) : result
}
