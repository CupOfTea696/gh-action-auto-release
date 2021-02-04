import * as core from '@actions/core'
import { getOctokitOptions, GitHub as Octokit } from '@actions/github/lib/utils'
import { requestLog } from '@octokit/plugin-request-log'

const format = (msgs) => {
  return msgs.reduce((str, msg) => {
    if (typeof msg !== 'string') {
      msg = JSON.stringify(msg, undefined, 2)
    }

    return [str, msg].filter(v => v !== '').join(' ')
  }, '')
}

class GitHub {
  constructor(token, options = {}) {
    options = Object.assign({}, {
      log: {
        debug: (...msgs) => {
          core.debug(format(msgs))
        },
        info: (...msgs) => {
          core.info(format(msgs))
        },
        warn: (...msgs) => {
          core.warning(format(msgs))
        },
        error: (...msgs) => {
          core.error(format(msgs))
        },
      },
    }, options)

    return new GitHub.Octokit(getOctokitOptions(token, options))
  }

  static get Octokit() {
    return Octokit.plugin(requestLog)
  }
}

export default GitHub
