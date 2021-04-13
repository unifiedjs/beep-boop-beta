module.exports = commentPragma

var encode = require('stringify-entities/light')

function commentPragma(id) {
  return '<!--xxx:beep-boop:' + encode(id, {escapeOnly: true}) + '-->'
}
