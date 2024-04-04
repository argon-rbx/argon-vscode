import * as vscode from 'vscode'
import * as childProcess from 'child_process'
import * as logger from './logger'
import * as util from './util'

function log(data: string) {
  if (data.startsWith('ERROR')) {
    logger.error(data.slice(7))
  } else if (data.startsWith('WARN')) {
    logger.warn(data.slice(6))
  } else if (data.startsWith('INFO')) {
    logger.info(data.slice(6))
  } else {
    logger.info(data)
  }
}

function run(command: string) {
  let process = childProcess.exec('argon ' + command + ' --yes --color never', {
    cwd: util.getCurrentDir(),
  })

  process.stdout?.on('data', (data) => {
    log(data)
  })

  process.stderr?.on('data', (data) => {
    log(data)
  })
}

export function init(project: string, template: string, options: string[]) {
  run(`init ${project} --template ${template} ${options.join(' ')}`)
}

export function exec(code: string) {
  console.log(code)

  run(`exec "${code}"`)
}

export function studio() {
  run('studio')
}

export function plugin() {
  run('plugin')
}
