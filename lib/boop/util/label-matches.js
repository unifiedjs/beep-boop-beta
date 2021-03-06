import minimatch from 'minimatch'

export function labelMatches(label, expression) {
  return minimatch(toSlug(label.name), toSlug(expression))
}

// From:
// <https://github.com/unifiedjs/github-tools/blob/main/lib/util/to-label-slug.js>.
function toSlug(value) {
  return (
    value
      // Remove Gemoji shortcodes
      .replace(/:[^:]+:/g, '')
      // Remove non-ASCII
      // eslint-disable-next-line no-control-regex
      .replace(/[^\u0000-\u007F]/g, '')
      // Replace dash and underscore with a space.
      .replace(/[-_]/g, ' ')
      // Trim.
      .trim()
      // Replace multiple spaces
      .replace(/\s+/g, '-')
  )
}
