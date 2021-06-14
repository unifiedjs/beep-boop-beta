import {is} from 'unist-util-is'
import {visit, EXIT} from 'unist-util-visit'

export function templateNameFromMdast(tree) {
  const head = tree.children[0]
  let match = is(head, 'html') && /^<!--\s*([a-z\d-]+):/i.exec(head.value)

  visit(tree, 'html', (node) => {
    const newMatch = /^<!--do not edit: ([a-z\d-]+)-->$/i.exec(node.value)
    if (newMatch) {
      match = newMatch
      return EXIT
    }
  })

  return match && match[1].toLowerCase()
}
