module.exports = checkTemplate

var setupTemplates = require('../setup/templates')

async function checkTemplate(ctx, event, status) {
  await setupTemplates(ctx, event)
  return ctx.data.checkTemplateStatus === status
}
