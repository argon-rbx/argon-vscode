import * as childProcess from 'child_process'
import * as logger from './logger'
import { getCurrentDir } from './util'

function log(data: string) {
  let output = null

  for (const line of data.trim().split('\n')) {
    const isVerbose = line.endsWith(']')

    if (line.startsWith('ERROR')) {
      logger.error(line, isVerbose)
    } else if (line.startsWith('WARN')) {
      logger.warn(line, isVerbose)
    } else {
      logger.info(line, isVerbose)
    }

    if (!isVerbose) {
      output = line
    }
  }

  return output
}

async function spawn(args: string[]) {
  const process = childProcess.spawn(
    'argon',
    args.concat(['-vvv', '--yes', '--color', 'never']),
    {
      cwd: getCurrentDir(),
    },
  )

  const lastOutput: Promise<string> = new Promise((resolve) => {
    process.stdout?.on('data', (data) => {
      const output = log(data.toString())

      if (output) {
        resolve(output)
      }
    })

    process.stderr?.on('data', (data) => {
      const output = log(data.toString())

      if (output) {
        resolve(output)
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
  const message = await spawn(['serve', project, id.toString(), ...options])

  return [id, message]
}

export async function build(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await spawn(['build', project, id.toString(), ...options])
    return id
  }

  await spawn(['build', project, ...options])
}

export async function sourcemap(project: string, options: string[]) {
  if (options.includes('--watch')) {
    const id = Date.now()
    await spawn(['sourcemap', project, id.toString(), ...options])
    return id
  }

  await spawn(['sourcemap', project, ...options])
}

export function init(project: string, template: string, options: string[]) {
  spawn(['init', project, '--template', template, ...options])
}

export function stop(id: number) {
  spawn(['stop', id.toString()])
}

export function debug(mode: string) {
  spawn(['debug', mode])
}

export function exec(code: string) {
  spawn(['exec', `"${code}"`])
}

export function studio() {
  spawn(['studio'])
}

export function plugin() {
  spawn(['plugin'])
}

export function version() {
  return childProcess.execSync('argon --version').toString()
}
