import {templates} from '../setup/templates.js'

export async function checkTemplate(ctx, event, status) {
  await templates(ctx, event)
  return ctx.data.checkTemplateStatus === status
}
