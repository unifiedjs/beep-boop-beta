module.exports = actionSleep

var ms = require('ms')

async function actionSleep(ctx, event, value) {
  var delay = ms(value || '1m')
  console.info('Going to sleep for %s', ms(delay))
  await sleep(delay)
  console.info('Waking up')
  // Reset data, as we waited a couple minutes, do new setups.
  ctx.data = {}
}

function sleep(delay) {
  return new Promise(executor)
  function executor(resolve) {
    setTimeout(resolve, delay)
  }
}
