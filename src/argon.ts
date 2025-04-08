import * as childProcess from "child_process"
import * as logger from "./logger"
import * as config from "./config"
import { getCurrentDir } from "./util"

let lastId = 0

export type DebugMode = "play" | "run" | "start" | "stop" | "studio"
export type PluginMode = "install" | "uninstall"
export type UpdateMode = "all" | "cli" | "plugin" | "templates"

function log(data: string, silent?: boolean) {
  let output = undefined

  for (const line of data.trim().split("\n")) {
    const isVerbose = line.endsWith("]") || !/^.{0,5}:/.test(line)

    if (line.startsWith("ERROR")) {
      logger.error(line, isVerbose)
    } else if (line.startsWith("WARN")) {
      logger.warn(line, isVerbose)
    } else {
      logger.info(line, isVerbose || silent)
    }

    if (!isVerbose && !output) {
      output = line
    }
  }

  return output
}

async function spawn(
  args: string[],
  silent?: boolean,
): Promise<[string, number | null]> {
  const commandString = `argon ${args.join(" ")}`
  logger.info(`Spawning: ${commandString}`, true)

  const process = childProcess.spawn(
    "argon",
    args.concat([
      config.verbose() ? "-vvvv" : "-v",
      "--yes",
      "--color",
      "never",
    ]),
    {
      cwd: getCurrentDir(),
      shell: true,
    },
  )

  let firstOutput = ""
  let stderrOutput = ""

  const outputPromise: Promise<string> = new Promise((resolve) => {
    process.stdout?.on("data", (data) => {
      const lines = data.toString()
      logger.info(`stdout: ${lines}`, true)
      const processedOutput = log(lines, silent)
      if (processedOutput && !firstOutput) {
        firstOutput = processedOutput
      }
    })

    process.stderr?.on("data", (data) => {
      const lines = data.toString()
      logger.error(`stderr: ${lines}`, true)
      stderrOutput += lines
      const processedOutput = log(lines, silent)
      if (processedOutput && !firstOutput) {
        firstOutput = processedOutput
      }
    })

    process.on("close", (code) => {
      logger.info(`Process exited with code: ${code}`, true)
      resolve(firstOutput || stderrOutput || "Process finished without output.")
    })

    process.on("error", (err) => {
      logger.error(`Spawn error: ${err.message}`, true)
      resolve(`Spawn error: ${err.message}`)
    })
  })

  const finalOutput = await outputPromise
  const exitCode = process.exitCode

  logger.info(
    `Command "${commandString}" finished with code ${exitCode}. Output: ${finalOutput}`,
    true,
  )

  if (exitCode === 0) {
    return Promise.resolve([finalOutput, exitCode])
  } else {
    const errorMessage =
      stderrOutput || finalOutput || `Command failed with exit code ${exitCode}`
    return Promise.reject([errorMessage.trim(), exitCode])
  }
}

function generateId() {
  let id = Date.now()

  if (id === lastId) {
    id++
  }

  lastId = id

  return id
}

export async function serve(
  project: string,
  options: string[],
): Promise<[number, string]> {
  const id = generateId()
  const message = await spawn(["serve", project, id.toString(), ...options])
  return [id, message[0]]
}

export async function build(
  project: string,
  options: string[],
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    await spawn(["build", project, id.toString(), ...options])
    return id
  }
  await spawn(["build", project, ...options])
}

export async function sourcemap(
  project: string,
  options: string[],
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    await spawn(["sourcemap", project, id.toString(), ...options])
    return id
  }
  await spawn(["sourcemap", project, ...options])
}

export async function init(
  project: string,
  template: string,
  options: string[],
): Promise<void> {
  await spawn(["init", project, "--template", template, ...options])
}

export async function stop(ids: number[]): Promise<void> {
  await spawn(["stop", ...ids.map((id) => id.toString())], true)
}

export async function debug(mode: DebugMode): Promise<void> {
  await spawn(["debug", mode], true)
}

export async function exec(code: string, focus?: boolean): Promise<void> {
  const args = focus ? ["--focus"] : []
  await spawn(["exec", code, ...args], true)
}

export async function studio(check?: boolean, place?: string): Promise<void> {
  const args = []
  if (place) {
    args.push(place)
  }
  if (check) {
    args.push("--check")
  }
  await spawn(["studio", ...args], true)
}

export async function plugin(mode: PluginMode): Promise<void> {
  await spawn(["plugin", mode])
}

export async function update(mode: UpdateMode, auto?: boolean): Promise<void> {
  await spawn(["update", mode], auto)
}

export function version() {
  return childProcess.execSync("argon --version").toString()
}
