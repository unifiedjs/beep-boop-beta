'use strict'

var fs = require('fs')
var path = require('path')
var yaml = require('js-yaml')
var beep = require('./lib/beep')
var custom = require('./lib/custom')
var renderers = require('./lib/renderers')

beep({
  tasks: yaml.load(String(fs.readFileSync(path.join(__dirname, 'tasks.yml')))),
  plugins: [custom],
  renderers
})
