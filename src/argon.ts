import * as childProcess from "child_process"
import * as fs from "fs" // Import fs for file logging
import * as logger from "./logger"
import * as config from "./config"
import { getCurrentDir } from "./util"

let lastId = 0

export type DebugMode = "play" | "run" | "start" | "stop" | "studio"
export type PluginMode = "install" | "uninstall"
export type UpdateMode = "all" | "cli" | "plugin" | "templates"

// Internal logging function for argon.ts, writes to the provided log file
function logToFile(message: string, logFilePath?: string) {
  if (!logFilePath) return // Only log if a path is provided
  try {
    const timestamp = new Date().toISOString()
    fs.appendFileSync(logFilePath, `[${timestamp}] [argon.ts] ${message}\n`)
  } catch (err) {
    console.error("[argon.ts] Failed to write to log file:", err)
  }
}

function log(data: string, silent?: boolean, logFilePath?: string) {
  // Add logFilePath
  let output = undefined
  logToFile(`Raw log data: ${data}`, logFilePath) // Log raw data

  for (const line of data.trim().split("\n")) {
    const isVerbose = line.endsWith("]") || !/^.{0,5}:/.test(line)

    if (line.startsWith("ERROR")) {
      logger.error(line, isVerbose)
      logToFile(`Parsed as ERROR: ${line}`, logFilePath) // Log parsed level
    } else if (line.startsWith("WARN")) {
      logger.warn(line, isVerbose)
      logToFile(`Parsed as WARN: ${line}`, logFilePath)
    } else {
      logger.info(line, isVerbose || silent)
      logToFile(`Parsed as INFO: ${line}`, logFilePath)
    }

    if (!isVerbose && !output) {
      output = line
    }
  }

  return output
}

// Define options for spawn
interface SpawnOptions {
  cwd?: string
  shell?: boolean
  env?: NodeJS.ProcessEnv
  // New option: Resolve promise when this pattern is matched in stdout/stderr
  resolveOnOutputPattern?: RegExp
}

async function spawn(
  args: string[],
  options?: {
    silent?: boolean
    logFilePath?: string
    resolveOnOutputPattern?: RegExp // Add pattern to options object
  },
): Promise<[string, number | null]> {
  const commandString = `argon ${args.join(" ")}`
  const { silent, logFilePath, resolveOnOutputPattern } = options || {} // Destructure options

  logger.info(`Spawning: ${commandString}`, true) // Log to output channel
  logToFile(`ARGON_SPAWN: Spawning command: ${commandString}`, logFilePath) // Log to file
  logToFile(`ARGON_SPAWN: Args: ${JSON.stringify(args)}`, logFilePath)
  logToFile(`ARGON_SPAWN: Silent: ${silent}`, logFilePath)
  logToFile(`ARGON_SPAWN: CWD: ${getCurrentDir()}`, logFilePath)
  logToFile(
    `ARGON_SPAWN: Resolve Pattern: ${resolveOnOutputPattern}`,
    logFilePath,
  )

  const spawnOptions: childProcess.SpawnOptionsWithoutStdio = {
    // Use correct type
    cwd: getCurrentDir(),
    shell: true,
    env: { ...process.env, RUST_LOG: config.verbose() ? "trace" : "info" },
  }
  logToFile(
    `ARGON_SPAWN: Spawn options: ${JSON.stringify(spawnOptions)}`,
    logFilePath,
  )

  let spawnedProcess: childProcess.ChildProcess | null = null // Declare and initialize here

  try {
    spawnedProcess = childProcess.spawn(
      // Assign here
      "argon",
      args.concat([
        config.verbose() ? "-vvvv" : "-v",
        "--yes",
        "--color",
        "never",
      ]),
      spawnOptions,
    )
    logToFile(
      `ARGON_SPAWN: Process spawned with PID: ${spawnedProcess.pid}`,
      logFilePath,
    )
  } catch (spawnError) {
    const errorMsg =
      spawnError instanceof Error ? spawnError.message : String(spawnError)
    logToFile(
      `ARGON_SPAWN_ERROR: Failed to spawn process: ${errorMsg}`,
      logFilePath,
    )
    logger.error(`Failed to spawn process: ${errorMsg}`, false, true) // Show error to user
    // Reject the promise immediately if spawning fails
    return Promise.reject([`Failed to spawn process: ${errorMsg}`, null])
  }

  // --- From here on, we know spawnedProcess is not null if the try block succeeded ---
  const currentProcess = spawnedProcess // Use a new const to satisfy TypeScript's null checks

  let firstOutput = ""
  let stderrOutput = ""
  let promiseResolved = false // Flag to prevent double resolution

  const outputPromise: Promise<string> = new Promise((resolve) => {
    logToFile(
      `ARGON_SPAWN: Setting up event listeners for PID: ${currentProcess.pid}`,
      logFilePath,
    )

    const processOutput = (data: Buffer | string, streamName: string) => {
      if (promiseResolved) return // Don't process if already resolved

      const lines = data.toString()
      logToFile(
        `ARGON_SPAWN_${streamName}: PID ${currentProcess.pid}: ${lines.trim()}`,
        logFilePath,
      )

      if (streamName === "STDOUT") {
        logger.info(`stdout: ${lines}`, true)
      } else {
        logger.error(`stderr: ${lines}`, true)
        stderrOutput += lines // Still collect stderr for potential errors
      }

      const processedOutput = log(lines, silent, logFilePath)
      if (processedOutput && !firstOutput) {
        firstOutput = processedOutput
      }

      // Check if we should resolve based on pattern
      if (resolveOnOutputPattern && resolveOnOutputPattern.test(lines)) {
        logToFile(
          `ARGON_SPAWN: Pattern ${resolveOnOutputPattern} matched in ${streamName}. Resolving early.`,
          logFilePath,
        )
        promiseResolved = true
        resolve(lines.trim()) // Resolve with the matching line
      }
    }

    currentProcess.stdout?.on("data", (data) => processOutput(data, "STDOUT"))
    currentProcess.stderr?.on("data", (data) => processOutput(data, "STDERR"))

    currentProcess.on("close", (code, signal) => {
      if (promiseResolved) return // Don't resolve again if pattern already matched
      logToFile(
        `ARGON_SPAWN_CLOSE: PID ${currentProcess.pid} exited with code: ${code}, signal: ${signal}`,
        logFilePath,
      )
      logger.info(`Process exited with code: ${code}, signal: ${signal}`, true)
      promiseResolved = true
      // If it closes *before* pattern match, resolve with collected output/error
      resolve(
        firstOutput ||
          stderrOutput ||
          `Process finished (code ${code}, signal ${signal}).`,
      )
    })

    currentProcess.on("error", (err) => {
      if (promiseResolved) return
      logToFile(
        `ARGON_SPAWN_ERROR: PID ${currentProcess.pid} spawn error: ${err.message}`,
        logFilePath,
      )
      logger.error(`Spawn error: ${err.message}`, true)
      promiseResolved = true
      resolve(`Spawn error: ${err.message}`)
    })
  })

  logToFile(
    `ARGON_SPAWN: Awaiting outputPromise for PID: ${currentProcess.pid}`,
    logFilePath,
  )
  const finalOutput = await outputPromise
  // Exit code might be null if we resolved early based on pattern
  const exitCode = currentProcess.exitCode
  logToFile(
    `ARGON_SPAWN: outputPromise resolved for PID: ${currentProcess.pid}. Exit code: ${exitCode}, Final Output: ${finalOutput}`,
    logFilePath,
  )

  logger.info(
    `Command "${commandString}" finished. Exit Code: ${exitCode ?? "N/A (Pattern Resolved)"}. Output: ${finalOutput}`,
    true,
  )

  // If we resolved based on pattern, consider it a success for that purpose
  if (resolveOnOutputPattern && promiseResolved && exitCode === null) {
    logToFile(
      `ARGON_SPAWN: Command resolved via pattern for PID: ${currentProcess.pid}`,
      logFilePath,
    )
    return Promise.resolve([finalOutput, null]) // Return null exit code as it's still running
  }

  // Otherwise, use the actual exit code
  if (exitCode === 0) {
    logToFile(
      `ARGON_SPAWN: Command succeeded (closed) for PID: ${currentProcess.pid}`,
      logFilePath,
    )
    return Promise.resolve([finalOutput, exitCode])
  } else {
    const errorMessage =
      stderrOutput || finalOutput || `Command failed with exit code ${exitCode}`
    logToFile(
      `ARGON_SPAWN: Command failed (closed) for PID: ${currentProcess.pid}. Error: ${errorMessage.trim()}`,
      logFilePath,
    )
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
  logFilePath?: string, // Add optional logFilePath parameter
): Promise<[number, string]> {
  const id = generateId()
  const pattern = /Serving on: (http:\/\/[^\s,]+)/ // Regex to capture the address
  logToFile(
    `Calling spawn for 'serve' with ID: ${id}, resolve pattern: ${pattern}`,
    logFilePath,
  )

  try {
    // Call spawn with the resolve pattern
    const [output] = await spawn(
      ["serve", project, id.toString(), ...options],
      { logFilePath: logFilePath, resolveOnOutputPattern: pattern },
    )

    const match = output.match(pattern)
    if (match && match[1]) {
      const address = match[1]
      logToFile(
        `Spawn for 'serve' (ID: ${id}) resolved via pattern. Address: ${address}`,
        logFilePath,
      )
      return [id, address] // Return the captured address
    } else {
      // This case should ideally not happen if the pattern is correct and CLI output is consistent
      logToFile(
        `Spawn for 'serve' (ID: ${id}) resolved via pattern, but address not found in output: ${output}`,
        logFilePath,
      )
      throw new Error("Serve started, but could not parse address from output.")
    }
  } catch (error) {
    // Handle potential rejections from spawn (e.g., spawn failure, or process closing with error before pattern match)
    const errorMessage = Array.isArray(error)
      ? error[0]
      : error instanceof Error
        ? error.message
        : String(error)
    const exitCode = Array.isArray(error) ? error[1] : null
    logToFile(
      `Spawn for 'serve' (ID: ${id}) failed. Code: ${exitCode}, Error: ${errorMessage}`,
      logFilePath,
    )
    // Re-throw or handle as appropriate for the calling function
    throw new Error(`Failed to start serve process: ${errorMessage}`)
  }
}

export async function build(
  project: string,
  options: string[],
  logFilePath?: string, // Add optional logFilePath parameter
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    const pattern = /Build successful/ // Example pattern for build --watch readiness
    logToFile(`Calling spawn for 'build --watch' with ID: ${id}`, logFilePath)
    // Potentially use resolveOnOutputPattern if build --watch signals readiness
    await spawn(["build", project, id.toString(), ...options], {
      logFilePath: logFilePath,
      resolveOnOutputPattern: pattern,
    })
    logToFile(
      `Spawn for 'build --watch' (ID: ${id}) completed/resolved.`,
      logFilePath,
    )
    return id
  }
  logToFile(`Calling spawn for 'build'`, logFilePath)
  await spawn(["build", project, ...options], { logFilePath: logFilePath })
  logToFile(`Spawn for 'build' completed.`, logFilePath)
}

export async function sourcemap(
  project: string,
  options: string[],
  logFilePath?: string,
): Promise<number | void> {
  if (options.includes("--watch")) {
    const id = generateId()
    // Add pattern if sourcemap --watch signals readiness
    await spawn(["sourcemap", project, id.toString(), ...options], {
      logFilePath: logFilePath /*, resolveOnOutputPattern: /some pattern/* */,
    })
    return id
  }
  await spawn(["sourcemap", project, ...options], { logFilePath: logFilePath })
}

export async function init(
  project: string,
  template: string,
  options: string[],
  logFilePath?: string,
): Promise<void> {
  await spawn(["init", project, "--template", template, ...options], {
    logFilePath: logFilePath,
  })
}

export async function stop(ids: number[], logFilePath?: string): Promise<void> {
  await spawn(["stop", ...ids.map((id) => id.toString())], {
    silent: true,
    logFilePath: logFilePath,
  })
}

export async function debug(
  mode: DebugMode,
  logFilePath?: string,
): Promise<void> {
  await spawn(["debug", mode], { silent: true, logFilePath: logFilePath })
}

export async function exec(
  code: string,
  focus?: boolean,
  logFilePath?: string,
): Promise<void> {
  const args = focus ? ["--focus"] : []
  await spawn(["exec", code, ...args], {
    silent: true,
    logFilePath: logFilePath,
  })
}

export async function studio(
  check?: boolean,
  place?: string,
  logFilePath?: string,
): Promise<void> {
  const args = []
  if (place) {
    args.push(place)
  }
  if (check) {
    args.push("--check")
  }
  await spawn(["studio", ...args], { silent: true, logFilePath: logFilePath })
}

export async function plugin(
  mode: PluginMode,
  logFilePath?: string,
): Promise<void> {
  await spawn(["plugin", mode], { logFilePath: logFilePath })
}

export async function update(
  mode: UpdateMode,
  auto?: boolean,
  logFilePath?: string,
): Promise<void> {
  await spawn(["update", mode], { silent: auto, logFilePath: logFilePath })
}

export function version() {
  // Keep version sync
  try {
    return childProcess.execSync("argon --version").toString()
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    // Cannot log to file here easily as logFilePath isn't available
    console.error(`[argon.ts] Failed to get version: ${errorMsg}`)
    logger.error(`Failed to get Argon version: ${errorMsg}`, true) // Log to output, but silently
    return undefined // Return undefined if version check fails
  }
}
