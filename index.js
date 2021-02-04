import * as core from '@actions/core'
import action from './src/index.js'

action.run().catch(err => {
  core.setOutput('released', false)
  core.setFailed(`${err}`)
})
