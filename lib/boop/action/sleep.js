import ms from 'ms'

export async function sleep(ctx, event, value) {
  const delay = ms(value || '1m')
  console.info('Going to sleep for %s', ms(delay))
  await sleep_(delay)
  console.info('Waking up')
  // Reset data, as we waited a couple minutes, do new setups.
  ctx.data = {}
}

function sleep_(delay) {
  return new Promise(executor)
  function executor(resolve) {
    setTimeout(resolve, delay)
  }
}
