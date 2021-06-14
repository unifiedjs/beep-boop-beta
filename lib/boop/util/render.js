import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'

var processor = unified().use(remarkParse).use(remarkStringify).use(remarkGfm)

var own = {}.hasOwnProperty

export async function render(ctx, event, parameters) {
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
