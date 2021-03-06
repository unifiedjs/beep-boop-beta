import fs from 'fs'
import yaml from 'js-yaml'
import {beep} from './lib/beep/index.js'
import {custom} from './lib/custom/index.js'
import {renderers} from './lib/renderers/index.js'

beep({
  tasks: yaml.load(
    String(fs.readFileSync(new URL('./tasks.yml', import.meta.url)))
  ),
  plugins: [custom],
  renderers
})
