'use strict'

var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var beep = require('./lib/beep/index.js')
var custom = require('./lib/custom/index.js')
var renderers = require('./lib/renderers/index.js')

beep({
  tasks: yaml.load(String(fs.readFileSync(path.join(__dirname, 'tasks.yml')))),
  plugins: [custom],
  renderers
})
