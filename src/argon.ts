import * as childProcess from "child_process"
import * as logger from "./logger"
import * as config from "./config"
import { getCurrentDir } from "./util"

let lastId = 0

export type DebugMode = "play" | "run" | "start" | "stop" | "studio"
export type PluginMode = "install" | "uninstall"
export type UpdateMode = "all" | "cli" | "plugin" | "templates"

// Simplified log function - no file logging
function log(data: string, silent?: boolean) {
  let output = undefined

  for (const line of data.trim().split("\n")) {
    const isVerbose = line.endsWith("]") || !/^.{0,5}:/.test(line)

    if (line.startsWith("ERROR")) {
      logger.error(line, isVerbose)
    } else if (line.startsWith("WARN")) {
      logger.warn(line, isVerbose)
    } else {
      // Log info to output channel (respecting silent flag)
      logger.info(line, isVerbose || silent)
    }

    if (!isVerbose && !output) {
      output = line
    }
  }

  return output
}

// Spawn options simplified
interface SpawnInternalOptions {
  silent?: boolean
  resolveOnOutputPattern?: RegExp
}

async function spawn(
  args: string[],
  options?: SpawnInternalOptions, // Use simplified options
): Promise<[string, number | null]> {
  const commandString = `argon ${args.join(" ")}`
  const { silent, resolveOnOutputPattern } = options || {}

  // Log basic spawning info (silently)
  logger.info(`Spawning: ${commandString}`, true)

  const spawnOptions: childProcess.SpawnOptionsWithoutStdio = {
    cwd: getCurrentDir(),
    shell: true,
    env: { ...process.env, rustLog: config.verbose() ? "trace" : "info" },
  }

  let spawnedProcess: childProcess.ChildProcess | null = null

  try {
    spawnedProcess = childProcess.spawn(
      "argon",
      args.concat([
        config.verbose() ? "-vvvv" : "-v",
        "--yes",
        "--color",
        "never",
      ]),
      spawnOptions,
    )
  } catch (spawnError) {
    const errorMsg =
      spawnError instanceof Error ? spawnError.message : String(spawnError)
    // Log error visibly
    logger.error(`Failed to spawn process: ${errorMsg}`, false, true)
    return Promise.reject([`Failed to spawn process: ${errorMsg}`, null])
  }

  const currentProcess = spawnedProcess
  let firstOutput = ""
  let stderrOutput = ""
  let promiseResolved = false

  const outputPromise: Promise<string> = new Promise((resolve) => {
    const processOutput = (data: Buffer | string, streamName: string) => {
      if (promiseResolved) {
        return;
      }

      const lines = data.toString()
      // Log output silently to channel
      if (streamName === "STDOUT") {
        logger.info(`stdout: ${lines.trim()}`, true)
      } else {
        logger.error(`stderr: ${lines.trim()}`, true)
        stderrOutput += lines
      }

      // Parse and process log levels (respecting silent)
      const processedOutput = log(lines, silent)
      if (processedOutput && !firstOutput) {
        firstOutput = processedOutput
      }

      // Check pattern for early resolve (used by serve)
      if (resolveOnOutputPattern && resolveOnOutputPattern.test(lines)) {
        logger.info(
          `Pattern ${resolveOnOutputPattern} matched in ${streamName}. Resolving early.`,
          true,
        )
        promiseResolved = true
        resolve(lines.trim())
      }
    }

    currentProcess.stdout?.on("data", (data) => processOutput(data, "STDOUT"))
    currentProcess.stderr?.on("data", (data) => processOutput(data, "STDERR"))

    currentProcess.on("close", (code, signal) => {
      if (promiseResolved) {
        return;
      }
      logger.info(`Process exited with code: ${code}, signal: ${signal}`, true)
      promiseResolved = true
      resolve(
        firstOutput ||
          stderrOutput ||
          `Process finished (code ${code}, signal ${signal}).`,
      )
    })

    currentProcess.on("error", (err) => {
      if (promiseResolved) {
        return;
      }
      logger.error(`Spawn error: ${err.message}`, false, true) // Log spawn errors visibly
      promiseResolved = true
      resolve(`Spawn error: ${err.message}`)
    })
  })

  const finalOutput = await outputPromise
  const exitCode = currentProcess.exitCode

  // Log basic finish info (silently)
  logger.info(
    `Command "${commandString}" finished. Exit Code: ${exitCode ?? "N/A (Pattern Resolved)"}. Output: ${finalOutput}`,
    true,
  )

  if (resolveOnOutputPattern && promiseResolved && exitCode === null) {
    // Resolved via pattern
    return Promise.resolve([finalOutput, null])
  }

  if (exitCode === 0) {
    // Closed successfully
    return Promise.resolve([finalOutput, exitCode])
  } else {
    // Closed with error
    const errorMessage =
      stderrOutput || finalOutput || `Command failed with exit code ${exitCode}`
    // Don't log error here, as it was likely logged by logger.error in processOutput
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

// --- Exported Functions --- //

export async function serve(
  project: string,
  options: string[],
): Promise<[number, string]> {
  // Removed logFilePath
  const id = generateId()
  const pattern = /Serving on: (http:\/\/[^\s,]+)/
  // No file logging calls
  try {
    const [output] = await spawn(
      ["serve", project, id.toString(), ...options],
      // Pass only necessary options
      { resolveOnOutputPattern: pattern },
    )
    const match = output.match(pattern)
    if (match && match[1]) {
      return [id, match[1]]
    } else {
      throw new Error("Serve started, but could not parse address from output.")
    }
  } catch (error) {
    const errorMessage = Array.isArray(error)
      ? error[0]
      : error instanceof Error
        ? error.message
        : String(error)
    // Let logger.error in spawn handle showing the error
    throw new Error(`Failed to start serve process: ${errorMessage}`)
  }
}

// Other functions updated to call spawn without logFilePath or unnecessary options
export async function build(
  project: string,
  options: string[],
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    const pattern = /Build successful/ // Example pattern
    // Only pass pattern if needed
    await spawn(["build", project, id.toString(), ...options], {
      resolveOnOutputPattern: pattern,
    })
    return id
  }
  await spawn(["build", project, ...options]) // No options needed
}

export async function sourcemap(
  project: string,
  options: string[],
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    // Pass options object if pattern needed
    await spawn(
      [
        "sourcemap",
        project,
        id.toString(),
        ...options,
      ] /*, { resolveOnOutputPattern: /.../ } */,
    )
    return id
  }
  await spawn(["sourcemap", project, ...options]) // No options needed
}

export async function init(
  project: string,
  template: string,
  options: string[],
): Promise<void> {
  await spawn(["init", project, "--template", template, ...options]) // No options needed
}

export async function stop(ids: number[]): Promise<void> {
  // Pass silent option
  await spawn(["stop", ...ids.map((id) => id.toString())], { silent: true })
}

export async function debug(mode: DebugMode): Promise<void> {
  // Pass silent option
  await spawn(["debug", mode], { silent: true })
}

export async function exec(code: string, focus?: boolean): Promise<void> {
  const args = focus ? ["--focus"] : []
  // Pass silent option
  await spawn(["exec", code, ...args], { silent: true })
}

export async function studio(check?: boolean, place?: string): Promise<void> {
  const args = []
  if (place) {
    args.push(place)
  }
  if (check) {
    args.push("--check")
  }
  // Pass silent option
  await spawn(["studio", ...args], { silent: true })
}

export async function plugin(mode: PluginMode): Promise<void> {
  await spawn(["plugin", mode]) // No options needed
}

export async function update(mode: UpdateMode, auto?: boolean): Promise<void> {
  // Pass silent option if auto is true
  await spawn(["update", mode], { silent: auto })
}

export function version(): string | undefined {
  // Added undefined return type
  try {
    return childProcess.execSync("argon --version").toString()
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error(`[argon.ts] Failed to get version: ${errorMsg}`)
    logger.error(`Failed to get Argon version: ${errorMsg}`, true)
    return undefined
  }
}
