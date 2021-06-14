import {addLabels} from './add-labels.js'
import {closePost} from './close-post.js'
import {comment} from './comment.js'
import {forgetComments} from './forget-comments.js'
import {minimizeComments} from './minimize-comments.js'
import {removeLabels} from './remove-labels.js'
import {reopenPost} from './reopen-post.js'
import {sleep} from './sleep.js'
import {unminimizeComments} from './unminimize-comments.js'

export const action = {
  'add-labels': addLabels,
  'close-post': closePost,
  comment,
  'forget-comments': forgetComments,
  'minimize-comments': minimizeComments,
  'remove-labels': removeLabels,
  'reopen-post': reopenPost,
  sleep,
  'unminimize-comments': unminimizeComments
}
