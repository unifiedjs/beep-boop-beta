export function is(ctx, event, type) {
  const {post} = event
  return post && post.type === type
}
