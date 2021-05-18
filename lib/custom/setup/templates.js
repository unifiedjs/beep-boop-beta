module.exports = setupCheckTemplate

var path = require('path')
var fetch = require('node-fetch')
var unified = require('unified')
var parse = require('remark-parse')
var stringify = require('remark-stringify')
var gfm = require('remark-gfm')
var vfile = require('vfile')
var matter = require('vfile-matter')
var similarity = require('similarity')
var getSections = require('../util/get-sections.js')
var templateNameFromMdast = require('../util/template-name-from-mdast.js')

var own = {}.hasOwnProperty

var processor = unified().use(parse).use(gfm).use(stringify)

async function setupCheckTemplate(ctx, event) {
  var {data, endpoint, headers} = ctx
  var {post, owner, repo} = event
  var {number} = post
  var result
  var body
  var tree
  var name
  var actual
  var expected
  var template
  var expectedIndex
  var actualIndex
  var status

  if (data.checkTemplateStatus) {
    return
  }

  // To do: paginate.
  result = await fetch(endpoint, {
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

  body =
    (result &&
      result.data &&
      result.data.repository &&
      result.data.repository.issueOrPullRequest &&
      result.data.repository.issueOrPullRequest.body) ||
    ''

  tree = processor.parse(body)
  name = templateNameFromMdast(tree)
  actual = getSections(tree, body)

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

    status = expected.filter((d) => !d.ok).length ? 'incorrect' : 'correct'
  } else {
    status = 'missing'
  }

  data.checkTemplateStatus = status
  data.checkTemplateChecks = expected
  data.checkTemplateName = name
}

async function setupTemplates(ctx, event) {
  var {endpoint, headers} = ctx
  var {owner, repo} = event

  // Already set up.
  if (ctx.data.templatesByName) {
    return
  }

  var result = await fetch(endpoint, {
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

  var repoBranch =
    (result &&
      result.data &&
      result.data.repo &&
      result.data.repo.defaultBranchRef &&
      result.data.repo.defaultBranchRef.name) ||
    'main'
  var orgBranch =
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

  var folders = []
  var files = []

  if (result && result.data && result.data.repo) {
    allEntries({owner, repo, branch: repoBranch}, result.data.repo)
  }

  if (result && result.data && result.data.org) {
    allEntries(
      {owner, repo: {name: '.github'}, branch: orgBranch},
      result.data.org
    )
  }

  var data
  var key
  var folder
  var index

  if (folders.length) {
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

  if (!files.length) {
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

  var templates = []
  var file
  var tree
  var info

  data = result.data || {}
  for (key in data) {
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
      file: file,
      tree: tree,
      type: info.type,
      name: templateNameFromMdast(tree)
    })
  }

  var templatesByName = {}

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

  if (!templates.length) {
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
    var index = -1
    var entry
    var type

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
