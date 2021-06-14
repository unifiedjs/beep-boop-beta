import {newTemplateCheck} from './new-template-check.js'
import {newTemplateMissing} from './new-template-missing.js'
import {noDuplicate} from './no-duplicate.js'
import {noDuplicateMaintainers} from './no-duplicate-maintainers.js'
import {noExternalMaintainers} from './no-external-maintainers.js'
import {noQuestion} from './no-question.js'
import {noWontfixMaintainers} from './no-wontfix-maintainers.js'
import {openMultiple} from './open-multiple.js'
import {openNeedsInfo} from './open-needs-info.js'
import {openNeedsRepro} from './open-needs-repro.js'
import {phaseless} from './phaseless.js'
import {postClosedIssueMaintainers} from './post-closed-issue-maintainers.js'
import {postClosedPrMaintainers} from './post-closed-pr-maintainers.js'
import {yesMaintainers} from './yes-maintainers.js'

export const renderers = {
  'new-template-check': newTemplateCheck,
  'new-template-missing': newTemplateMissing,
  'no-duplicate': noDuplicate,
  'no-duplicate-maintainers': noDuplicateMaintainers,
  'no-external-maintainers': noExternalMaintainers,
  'no-question': noQuestion,
  'no-wontfix': noWontfixMaintainers,
  'open-multiple': openMultiple,
  'open-needs-info': openNeedsInfo,
  'open-needs-repro': openNeedsRepro,
  phaseless,
  'post-closed-issue-maintainers': postClosedIssueMaintainers,
  'post-closed-pr-maintainers': postClosedPrMaintainers,
  'yes-maintainers': yesMaintainers
}
