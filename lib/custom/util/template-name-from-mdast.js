import is from 'unist-util-is'
import visit from 'unist-util-visit'

export function templateNameFromMdast(tree) {
  var head = tree.children[0]
  var match = is(head, 'html') && /^<!--\s*([a-z\d-]+):/i.exec(head.value)

  visit(tree, 'html', (node) => {
    var newMatch = /^<!--do not edit: ([a-z\d-]+)-->$/i.exec(node.value)
    if (newMatch) {
      match = newMatch
      return visit.EXIT
    }
  })

  return match && match[1].toLowerCase()
}
