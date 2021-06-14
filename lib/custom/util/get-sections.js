import {is} from 'unist-util-is'
import {visit} from 'unist-util-visit'
import {toString} from 'mdast-util-to-string'

export function getSections(tree, doc) {
  const sections = []
  visit(tree, onvisit)
  return sections

  function onvisit(node) {
    if (is(node, 'heading')) {
      sections.push({section: toString(node), ok: true})
    }

    if (
      sections.length > 0 &&
      ((is(node, 'listItem') && node.checked === false) ||
        (is(node, 'text') &&
          doc
            .slice(node.position.start.offset, node.position.end.offset)
            .includes('TODO')))
    ) {
      sections[sections.length - 1].ok = false
    }
  }
}
