import {stringifyEntitiesLight} from 'stringify-entities'

export function commentPragma(id) {
  return (
    '<!--xxx:beep-boop:' +
    stringifyEntitiesLight(id, {escapeOnly: true}) +
    '-->'
  )
}
