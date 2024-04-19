import * as childProcess from 'child_process'
import * as logger from './logger'
import { getCurrentDir } from './util'

function log(data: string) {
  data = data.trim()

  const isVerbose = data.endsWith(']')

  if (data.startsWith('ERROR')) {
    logger.error(data, isVerbose)
  } else if (data.startsWith('WARN')) {
    logger.warn(data, isVerbose)
  } else {
    logger.info(data, isVerbose)
  }

  return !isVerbose
}

async function run(command: string) {
  const process = childProcess.exec(
    'argon ' + command + ' -vvv --yes --color never',
    {
      cwd: getCurrentDir(),
    },
  )

  const lastOutput: Promise<string> = new Promise((resolve) => {
    process.stdout?.on('data', (data) => {
      if (log(data)) {
        resolve(data)
      }
    })

    process.stderr?.on('data', (data) => {
      if (log(data)) {
        resolve(data)
      }
    })
  })

  return process.exitCode === 0 || process.exitCode === null
    ? Promise.resolve(await lastOutput)
    : Promise.reject(await lastOutput)
}

export async function serve(
  project: string,
  options: string[],
): Promise<[number, string]> {
  const id = Date.now()
  const message = await run(`serve ${project} ${id} ${options.join(' ')}`)

  return [id, message]
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

export function debug(mode: string) {
  run(`debug ${mode}`)
}

export function exec(code: string) {
  run(`exec "${code}"`)
}

export function studio() {
  run('studio')
}

export function plugin() {
  run('plugin')
}

export function version() {
  return childProcess.execSync('argon --version').toString()
}
