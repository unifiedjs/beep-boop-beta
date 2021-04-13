module.exports = getSections

var is = require('unist-util-is')
var visit = require('unist-util-visit')
var toString = require('mdast-util-to-string')

function getSections(tree, doc) {
  var sections = []
  visit(tree, onvisit)
  return sections

  function onvisit(node) {
    if (is(node, 'heading')) {
      sections.push({section: toString(node), ok: true})
    }

    if (
      sections.length &&
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
