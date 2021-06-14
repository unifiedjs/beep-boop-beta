export function is(ctx, event, type) {
  var {post} = event
  return post && post.type === type
}
