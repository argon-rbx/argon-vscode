import * as childProcess from 'child_process'
import * as util from './util'

function exec(command: string) {
  return childProcess.execSync(command, {
    cwd: util.getCurrentDir(),
  })
}

export async function init(
  project: string,
  template: string,
  options: string[],
) {
  exec(`argon init ${project} --template ${template} ${options.join(' ')}`)
}
