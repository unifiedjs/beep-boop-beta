import encode from 'stringify-entities/light.js'

export function commentPragma(id) {
  return '<!--xxx:beep-boop:' + encode(id, {escapeOnly: true}) + '-->'
}
