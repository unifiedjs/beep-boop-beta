import {hasLabels} from './has-labels.js'
import {markedAsDuplicate} from './marked-as-duplicate.js'
import {is} from './is.js'
import {on} from './on.js'
import {recentComment} from './recent-comment.js'

export const condition = {
  'has-labels': hasLabels,
  'marked-as-duplicate': markedAsDuplicate,
  is,
  on,
  'recent-comment': recentComment
}
