import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"
import * as argon from "../argon" // Use correct relative path
import * as config from "../config" // Use correct relative path
import * as logger from "../logger" // Import logger
import { getCurrentDir } from "../util" // Use correct relative path
import { State } from "../state" // Import State if needed by run signature
import { Item } from "." // Import Item type from index

export const item: Item = {
  label: "$(rocket) Start Lemonade",
  description: "Click to initiate and sync with Roblox Studio",
  action: "startLemonade",
}

// Create log file path in the workspace root
let logFilePath = ""
let logStream: fs.WriteStream | null = null

// Function to initialize and get log file stream
function getLogStream(workspaceRoot: string): fs.WriteStream {
  if (logStream) {
    return logStream
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  logFilePath = path.join(workspaceRoot, `lemonade-debug-${timestamp}.log`)

  console.log(`Creating log file at: ${logFilePath}`)
  logStream = fs.createWriteStream(logFilePath, { flags: "a" })

  // Write header to log file
  logStream.write(`Lemonade Debug Log - ${new Date().toLocaleString()}\n\n`)
  return logStream
}

// Enhanced logging function that writes to both output channel and file
function logDebug(message: string, workspaceRoot: string) {
  // Get current timestamp
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}`

  // Log to output channel
  logger.outputChannel.appendLine(logMessage)

  // Log to file
  try {
    const stream = getLogStream(workspaceRoot)
    stream.write(logMessage + "\n")
  } catch (err) {
    console.error("Failed to write to log file:", err)
  }
}

const REQUIRED_SRC_DIRS = [
  "ReplicatedFirst",
  "ReplicatedStorage",
  "ServerScriptService",
  "ServerStorage",
  "StarterGui",
  "StarterPack",
  "StarterPlayer",
  "Workspace",
]

async function checkSrcStructure(workspaceRoot: string): Promise<boolean> {
  const srcPath = path.join(workspaceRoot, "src")
  if (!fs.existsSync(srcPath)) {
    logDebug(
      `Structure check failed: src directory not found at ${srcPath}`,
      workspaceRoot,
    )
    return false
  }

  try {
    const entries = fs.readdirSync(srcPath, { withFileTypes: true })
    const existingDirs = entries
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const allExist = REQUIRED_SRC_DIRS.every((reqDir) =>
      existingDirs.includes(reqDir),
    )
    if (!allExist) {
      const missing = REQUIRED_SRC_DIRS.filter(
        (reqDir) => !existingDirs.includes(reqDir),
      )
      logDebug(
        `Structure check failed: Missing required directories in src: ${missing.join(", ")}`,
        workspaceRoot,
      )
    } else {
      logDebug(
        "Structure check passed: All required directories found.",
        workspaceRoot,
      )
    }
    return allExist
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logDebug(`Error reading src directory: ${errorMessage}`, workspaceRoot)
    vscode.window.showErrorMessage(
      `Error reading src directory: ${errorMessage}`,
    )
    return false
  }
}

export async function run(_state: State) {
  // Keep State param if signature requires it
  const workspaceRoot = getCurrentDir()! // Assuming workspaceRoot is non-null after check

  // Initialize log file
  try {
    getLogStream(workspaceRoot)
    logDebug(
      `Starting Lemonade debug session in workspace: ${workspaceRoot}`,
      workspaceRoot,
    )
    logDebug(
      `Extension version: ${vscode.extensions.getExtension("lemonade-labs.lemonade")?.packageJSON.version || "unknown"}`,
      workspaceRoot,
    )
  } catch (err) {
    console.error("Failed to initialize log file:", err)
  }

  const hasStructure = await checkSrcStructure(workspaceRoot)

  if (!hasStructure) {
    const folderName = path.basename(workspaceRoot)
    logDebug(
      `Structure check failed for '${folderName}', showing initialization dialog`,
      workspaceRoot,
    )
    const choice = await vscode.window.showWarningMessage(
      `Your setup ('${folderName}') doesn't yet have the Lemonade necessary structure. Initialize it now?`,
      { modal: true },
      "Yes, Initialize",
    )

    if (choice === "Yes, Initialize") {
      logDebug(
        `User chose to initialize structure for '${folderName}'.`,
        workspaceRoot,
      )
      try {
        vscode.window.showInformationMessage(
          "Initializing project structure...",
        )
        logDebug("Running argon.init command...", workspaceRoot)
        await argon.init("default.project.json", "place", [])
        logDebug("argon.init command finished.", workspaceRoot)
        vscode.window.showInformationMessage("Initialization command finished.")

        const srcPath = path.join(workspaceRoot, "src")
        const projectPath = path.join(workspaceRoot, "default.project.json")
        if (fs.existsSync(srcPath) && fs.existsSync(projectPath)) {
          logDebug(
            "Initialization verification: src and project file exist.",
            workspaceRoot,
          )
          vscode.window.showInformationMessage(
            "Verification: src and project file exist.",
          )
          // Fall through to start server
        } else {
          const errorMsg = `Initialization verification failed: src (${fs.existsSync(srcPath)}) or default.project.json (${fs.existsSync(projectPath)}) not found.`
          logDebug(errorMsg, workspaceRoot)
          vscode.window.showErrorMessage(errorMsg)
          return
        }
      } catch (initError) {
        const errorMsg =
          initError instanceof Error ? initError.message : String(initError)
        logDebug(`Project initialization failed: ${errorMsg}`, workspaceRoot)
        vscode.window.showErrorMessage(
          `Project initialization failed: ${errorMsg}`,
        )
        return
      }
    } else {
      logDebug(
        `User cancelled initialization for '${folderName}'.`,
        workspaceRoot,
      )
      return // User cancelled init
    }
  }

  // Structure exists OR was just successfully initialized
  try {
    logDebug("Proceeding to start Lemonade server...", workspaceRoot)

    const projectPath = path.join(workspaceRoot, "default.project.json")
    if (!fs.existsSync(projectPath)) {
      const errorMsg = `default.project.json not found in ${workspaceRoot}. Cannot start server.`
      logDebug(errorMsg, workspaceRoot)
      vscode.window.showErrorMessage(errorMsg)
      return
    }

    const host = config.defaultHost() // Keep configured host for display
    const port = config.defaultPort() // Keep configured port for display
    const options = ["--host", host, "--port", port.toString(), "--sourcemap"]

    logDebug(
      `Attempting to start server with options: ${JSON.stringify(options)}`,
      workspaceRoot,
    )

    try {
      // argon.serve now returns [id, actualAddressString]
      const [sessionId, actualAddress] = await argon.serve(
        projectPath,
        options,
        logFilePath,
      )
      logDebug(
        `argon.serve finished. Session ID: ${sessionId}, Address: ${actualAddress}`,
        workspaceRoot,
      )
      logDebug("DEBUG_MARKER_1: After argon.serve call", workspaceRoot)

      // Verify we got a valid response (address string should be truthy)
      if (!sessionId || !actualAddress) {
        const errorMsg =
          "No valid session ID or address returned from argon.serve. Server might not have started correctly."
        logDebug(errorMsg, workspaceRoot)
        throw new Error(errorMsg)
      }

      logDebug(
        `DEBUG_MARKER_1.5: Session ID & Address verified: ${sessionId}, ${actualAddress}`,
        workspaceRoot,
      )

      // Directly attempt to launch Studio after server starts
      try {
        logDebug(
          "DEBUG_MARKER_2: Attempting to launch Studio...",
          workspaceRoot,
        )

        const studioMessage = `Lemonade server running on ${actualAddress}.`
        logDebug(studioMessage, workspaceRoot) // Log server running message

        // Unconditionally call argon.studio
        logDebug("DEBUG_MARKER_4: Launching Roblox Studio...", workspaceRoot)
        await argon.studio(false, undefined, logFilePath) // false = don't check, undefined = no specific path
        logDebug(
          "DEBUG_MARKER_5: argon.studio command finished.",
          workspaceRoot,
        )

        // Notify user that server is running and Studio is launching
        vscode.window.showInformationMessage(
          `${studioMessage} Launching Studio...`,
        )
      } catch (launchError) {
        const errorMsg =
          launchError instanceof Error
            ? launchError.message
            : String(launchError)
        logDebug(`ERROR launching Roblox Studio: ${errorMsg}`, workspaceRoot)
        console.error("ERROR launching Roblox Studio:", launchError)
        // Notify user about the server, but mention Studio launch failure
        vscode.window.showErrorMessage(
          `Server running on ${actualAddress}, but failed to launch Studio: ${errorMsg}`,
        )
      }

      logDebug("DEBUG_MARKER_10: After studio launch try-catch", workspaceRoot)
    } catch (serveError) {
      const errorMsg =
        serveError instanceof Error ? serveError.message : String(serveError)
      logDebug(
        `Failed during argon.serve or verification: ${errorMsg}`,
        workspaceRoot,
      )
      console.error(
        "[Lemonade] ERROR: Caught error in server start block:",
        serveError,
      )
      vscode.window.showErrorMessage(
        `Failed to start Lemonade server: ${errorMsg}`,
      )
    }
  } catch (outerError) {
    const errorMsg =
      outerError instanceof Error ? outerError.message : String(outerError)
    logDebug(
      `Failed unexpectedly before server start: ${errorMsg}`,
      workspaceRoot,
    )
    console.error("[Lemonade] ERROR: Caught error in outer block:", outerError)
    vscode.window.showErrorMessage(`Failed to start Lemonade: ${errorMsg}`)
  }

  logDebug("DEBUG_MARKER_11: End of function reached", workspaceRoot)
}
