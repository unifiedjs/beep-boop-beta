import path from 'path'
import fetch from 'node-fetch'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkGfm from 'remark-gfm'
import vfile from 'vfile'
import matter from 'vfile-matter'
import similarity from 'similarity'
import {getSections} from '../util/get-sections.js'
import {templateNameFromMdast} from '../util/template-name-from-mdast.js'

const own = {}.hasOwnProperty

const processor = unified().use(remarkParse).use(remarkStringify).use(remarkGfm)

export async function templates(ctx, event) {
  const {data, endpoint, headers} = ctx
  const {post, owner, repo} = event
  const {number} = post
  let expected
  let template
  let expectedIndex
  let actualIndex
  let status

  if (data.checkTemplateStatus) {
    return
  }

  // To do: paginate.
  const result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!, $number: Int!) {
          repository(owner: $owner, name: $repo) {
            issueOrPullRequest(number: $number) {
              ... on Issue { body }
              ... on PullRequest { body }
            }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name, number}
    }),
    headers
  }).then((d) => d.json())

  const body =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.body) ||
    ''

  const tree = processor.parse(body)
  const name = templateNameFromMdast(tree)
  const actual = getSections(tree, body)

  await setupTemplates(ctx, event)

  if (own.call(data.templatesByName, name)) {
    template = data.templatesByName[name]
    expected = getSections(template.tree, template.file.contents)

    expectedIndex = -1

    while (++expectedIndex < expected.length) {
      actualIndex = -1
      expected[expectedIndex].ok = null // Assume not found.

      while (++actualIndex < actual.length) {
        if (
          similarity(
            expected[expectedIndex].section,
            actual[actualIndex].section
          ) > 0.9
        ) {
          expected[expectedIndex].ok = actual[actualIndex].ok
          actual.splice(actualIndex, 1) // Remove so we don’t match again.
          break
        }
      }
    }

    status = expected.filter((d) => !d.ok).length > 0 ? 'incorrect' : 'correct'
  } else {
    status = 'missing'
  }

  data.checkTemplateStatus = status
  data.checkTemplateChecks = expected
  data.checkTemplateName = name
}

async function setupTemplates(ctx, event) {
  const {endpoint, headers} = ctx
  const {owner, repo} = event

  // Already set up.
  if (ctx.data.templatesByName) {
    return
  }

  let result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!) {
          repo: repository(owner: $owner, name: $repo) { defaultBranchRef { name } }
          org: repository(owner: $owner, name: ".github") { defaultBranchRef { name } }
        }
      `,
      variables: {owner: owner.name, repo: repo.name}
    }),
    headers
  }).then((d) => d.json())

  const repoBranch =
    (result &&
      result.data &&
      result.data.repo &&
      result.data.repo.defaultBranchRef &&
      result.data.repo.defaultBranchRef.name) ||
    'main'
  const orgBranch =
    (result &&
      result.data &&
      result.data.org &&
      result.data.org.defaultBranchRef &&
      result.data.org.defaultBranchRef.name) ||
    'main'

  result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: `
        query($owner: String!, $repo: String!) {
          repo: repository(owner: $owner, name: $repo) {
            root: object(expression: "${repoBranch}:") { ... on Tree { entries { name type } } }
            dotgithub: object(expression: "${repoBranch}:.github") { ... on Tree { entries { name type } } }
            docs: object(expression: "${repoBranch}:docs") { ... on Tree { entries { name type } } }
          }
          org: repository(owner: $owner, name: ".github") {
            root: object(expression: "${orgBranch}:") { ... on Tree { entries { name type } } }
            dotgithub: object(expression: "${orgBranch}:.github") { ... on Tree { entries { name type } } }
            docs: object(expression: "${orgBranch}:docs") { ... on Tree { entries { name type } } }
          }
        }
      `,
      variables: {owner: owner.name, repo: repo.name}
    }),
    headers
  }).then((d) => d.json())

  const folders = []
  const files = []

  if (result && result.data && result.data.repo) {
    allEntries({owner, repo, branch: repoBranch}, result.data.repo)
  }

  if (result && result.data && result.data.org) {
    allEntries(
      {owner, repo: {name: '.github'}, branch: orgBranch},
      result.data.org
    )
  }

  let data
  let key
  let folder
  let index

  if (folders.length > 0) {
    result = await fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        query: []
          .concat(
            'query {',
            folders.map(
              (d, i) =>
                `  q${i}: repository(owner: ${JSON.stringify(
                  d.owner.name
                )}, name: ${JSON.stringify(d.repo.name)}) {
                  object(expression: ${JSON.stringify(
                    d.branch + ':' + d.folder
                  )}) {
                    ... on Tree { entries { name type } }
                  }
                }`
            ),
            '}'
          )
          .join('\n')
      }),
      headers
    }).then((d) => d.json())

    data = result.data || {}
    for (key in data) {
      if (!own.call(data, key)) continue
      folder = folders[key.slice(1)]
      result = (data[key] && data[key].object && data[key].object.entries) || []
      index = -1
      while (++index < result.length) {
        if (
          result[index].type === 'blob' &&
          /\.md$/i.test(result[index].name)
        ) {
          files.push({...folder, name: result[index].name})
        }
      }
    }
  }

  if (files.length === 0) {
    console.info('Could not find templates')
    return
  }

  result = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({
      query: []
        .concat(
          'query {',
          files.map(
            (d, i) =>
              `  q${i}: repository(owner: ${JSON.stringify(
                d.owner.name
              )}, name: ${JSON.stringify(d.repo.name)}) {
                object(expression: ${JSON.stringify(
                  d.branch + ':' + path.posix.join(d.folder, d.name)
                )}) { ... on Blob { text } }
              }`
          ),
          '}'
        )
        .join('\n')
    }),
    headers
  }).then((d) => d.json())

  const templates = []
  let file
  let tree
  let info

  data = result.data || {}
  for (key in data) {
    if (!own.call(data, key)) continue
    info = files[key.slice(1)]
    if (!data[key] || !data[key].object || !data[key].object.text) {
      continue
    }

    file = vfile({
      contents: data[key].object.text,
      path: path.join(info.folder, info.name),
      url:
        'https://github.com/' +
        info.owner.name +
        '/' +
        info.repo.name +
        '/blob/' +
        info.branch +
        '/' +
        path.posix.join(info.folder, info.name)
    })

    if (info.type === 'issue') {
      matter(file, {strip: true})
    }

    tree = processor.parse(file)

    templates.push({
      file,
      tree,
      type: info.type,
      name: templateNameFromMdast(tree)
    })
  }

  const templatesByName = {}

  ctx.data.templatesByName = templatesByName
  index = -1

  while (++index < templates.length) {
    if (templates[index].name) {
      templatesByName[templates[index].name] = templates[index]
    } else {
      console.info(
        'Incorrect template `' +
          templates[index].file.path +
          '` (`' +
          templates[index].file.url +
          '`): expected comment name to start'
      )
    }
  }

  if (templates.length === 0) {
    console.info('Could not get templates')
  }

  function allEntries(info, object) {
    if (object.root && object.root.entries) {
      eachEntries({...info, folder: '.'}, object.root.entries)
    }

    if (object.dotgithub && object.dotgithub.entries) {
      eachEntries({...info, folder: '.github'}, object.dotgithub.entries)
    }

    if (object.docs && object.docs.entries) {
      eachEntries({...info, folder: 'docs'}, object.dotgithub.entries)
    }
  }

  function eachEntries(base, entries) {
    let index = -1
    let entry
    let type

    while (++index < entries.length) {
      entry = entries[index]

      type = /^pull[-_]request[-_]template(\.md)?$/i.test(entry.name)
        ? 'pr'
        : /^issue[-_]template(\.md)?$/i.test(entry.name)
        ? 'issue'
        : null

      if (type) {
        if (entry.type === 'blob') {
          files.push({...base, ...entry, type})
        }

        if (entry.type === 'tree') {
          folders.push({
            ...base,
            folder: path.posix.join(base.folder, entry.name),
            type
          })
        }
      }
    }
  }
}
