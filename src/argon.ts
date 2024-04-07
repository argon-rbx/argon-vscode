import * as childProcess from 'child_process'
import * as logger from './logger'
import * as util from './util'

function log(data: string) {
  data = data.trim()

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

  let lastOutput = ''

  process.stdout?.on('data', (data) => {
    lastOutput = data
    log(data)
  })

  process.stderr?.on('data', (data) => {
    lastOutput = data
    log(data)
  })

  return process.exitCode === 0 || process.exitCode === null
    ? Promise.resolve(lastOutput)
    : Promise.reject(lastOutput)
}

export async function serve(project: string, options: string[]) {
  const id = Date.now()
  await run(`serve ${project} ${id} ${options.join(' ')}`)
  return id
}

export async function build(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await run(`build ${project} ${id} ${options.join(' ')}`)
    return id
  }

  await run(`build ${project} ${options.join(' ')}`)
}

export async function sourcemap(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await run(`sourcemap ${project} ${id} ${options.join(' ')}`)
    return id
  }

  await run(`sourcemap ${project} ${options.join(' ')}`)
}

export function init(project: string, template: string, options: string[]) {
  run(`init ${project} --template ${template} ${options.join(' ')}`)
}

export function stop(id: number) {
  run(`stop ${id}`)
}

export function exec(code: string) {
  run(`exec "${code}"`)
}

export function debug(mode: string) {
  run(`debug ${mode}`)
}

export function studio() {
  run('studio')
}

export function plugin() {
  run('plugin')
}
