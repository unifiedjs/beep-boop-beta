import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'

const processor = unified().use(remarkParse).use(remarkStringify).use(remarkGfm)

const own = {}.hasOwnProperty

export async function render(ctx, event, parameters) {
  const renderers = ctx.renderers
  const keys = parameters.split(':')
  const key = keys.shift()

  if (!own.call(renderers, key)) {
    throw new Error('Unregistered render function `' + key + '`')
  }

  const result = renderers[key](ctx, event, ...keys)

  // Support mdast / string.
  return typeof result === 'object' ? processor.stringify(result) : result
}
