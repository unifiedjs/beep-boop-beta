module.exports = templateNameFromMdast

var is = require('unist-util-is')

function templateNameFromMdast(tree) {
  var head = tree.children[0]
  var match = is(head, 'html') && /^<!--\s*([a-z\d-]+):/i.exec(head.value)
  return match && match[1].toLowerCase()
}
