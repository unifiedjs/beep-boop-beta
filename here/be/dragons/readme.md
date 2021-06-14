# Beep boop

Beep boop is a little framework for building “if this then that” automation
for projects hosted on GitHub.

You can use it to make your own [GitHub Action][gh-actions], describing how your
project should be automated.

It is very much in beta, so that we can can test it out in [unified][].
Oh about tests: there are no tests (yet).

Beep boop consists of two parts: beep and boop

## Beep

Beep is the task runner.
You give it tasks, beep runs them, and handles recursion (GH Actions isn’t
recursive but we are).

Here is an example:

```yaml
- if: on:post-opened
  then: add-labels:phase/new
```

The above file defines a single **task**.
The task has a **condition**: if a post (issue or pull request) is opened.
And an action: add certain labels to that post.

A more complex task is:

```yml
- if: on:post-labeled:no/duplicate
  then:
    - remove-labels:no/{external,invalid,question,wontfix}
    - comment:no,no-duplicate
    - unminimize-comments:no
    - sleep:30s
    - if-not: marked-as-duplicate
      then: comment:no-duplicate-maintainers
```

Which in prose does the following when a certain label is applied:

*   remove certain labels
*   post a new, or update an existing, comment
*   show that comment (this makes sense because a different task minimizes it)
*   wait a while
*   if the post is not marked as a duplicate: post/update another comment

You can code your own conditions and actions, or you can use the built-in boop.

## Boop

Boop defines several conditions and actions.
It’s rather opinionated and currently pretty limited, because for now beep boop
is only made to handle unified’s issue tracker.

You can make your own boop!
A condition is just a function resolving to a boolean.
And an action is also only a function that does whatever.

## Install

[npm][] (currently not published, but you can get the repo):

```sh
npm install wooorm/beep-boop
```

## Use

```js
var fs = require('fs')
var yaml = require('js-yaml')
var beep = require('beep-boop')

beep({tasks: yaml.load(String(fs.readFileSync('tasks.yml')))})
```

### Action

The above code can be made into a [GitHub Action][gh-actions].
GH Actions in JavaScript must be bundles.
You can bundle the code up with [`@vercel/ncc`][ncc] (after installing the used
dependencies):

```sh
ncc build index.cjs -o .github/actions/my-action --license license
```

This example creates a [local action][gh-action-location], but you might want to
put it in its own repo.

For the action to work, it needs an [`action.yml`][gh-action-yml] file.

<details><summary>Minimum <code>action.yml</code></summary>

```yml
inputs:
  repo-token:
    description: Token for the repository. Can be passed in using {{secrets.GITHUB_TOKEN}}
    required: true
runs:
  using: node12
  main: index.cjs
```

</details>

### Workflow

Next, you need a workflow in the repos you want to be automated that runs your
action.
Workflows can be added to `.github/workflows`.

<details><summary>Example <code>bb.yml</code> workflow to act on all issue and PR events</summary>

```yml
name: bb
on:
  issues:
    types: [opened, reopened, edited, closed, labeled, unlabeled]
  pull_request_target:
    types: [opened, reopened, edited, closed, labeled, unlabeled]
jobs:
  main:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2 # Needed if your action is local
      - uses: ./.github/actions/my-action # Assuming local
        with:
          repo-token: ${{secrets.GITHUB_TOKEN}}
```

</details>

### Automation

The last thing to do is define your automation.
With the above set up, a `tasks.yml` file is expected that defines beep boop
automation.
Put that file in the place where you build your action from.
For example:

```yml
- if: on:post-opened
  then: close-post
```

The above makes sure that any opened issue or PR is immediately closed!
There, problem solves: open source is now scalable. 💪

[npm]: https://docs.npmjs.com/cli/install

[unified]: https://unifiedjs.com

[gh-actions]: https://github.com/features/actions

[gh-action-location]: https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/about-actions#choosing-a-location-for-your-action

[gh-action-yml]: https://docs.github.com/en/free-pro-team@latest/actions/creating-actions/metadata-syntax-for-github-actions

[ncc]: https://github.com/vercel/ncc
