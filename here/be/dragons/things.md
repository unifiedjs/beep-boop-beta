issue_comment: created, edited, deleted
issues & pull_request: opened, edited, closed, reopened, assigned, unassigned, labeled, unlabeled, locked, unlocked,
issues: deleted, transferred, pinned, unpinned, milestoned, demilestoned
pull_request (note: use `pull_request_target`): synchronize (pushed to pr branch), ready_for_review, review_requested, review_request_removed
pull_request_review: submitted, edited, dismissed
pull_request_review_comment: created, edited, deleted

CI status?

# Add label based on CI status

```yaml
- when: test:fail
  do: label:blocked/test
- when: test:pass
  do: unlabel:blocked/test
```

On release, gather mentioned issues/prs and add label/comments

Detect merge conflicts?

Cron jobs
