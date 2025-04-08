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
    return allExist
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    vscode.window.showErrorMessage(
      `Error reading src directory: ${errorMessage}`,
    )
    return false
  }
}

export async function run(_state: State) {
  const workspaceRoot = getCurrentDir()
  if (!workspaceRoot) {
    logger.error(
      "No workspace folder open. Please open your project folder.",
      false,
      true,
    )
    return
  }

  const hasStructure = await checkSrcStructure(workspaceRoot)

  if (!hasStructure) {
    const folderName = path.basename(workspaceRoot)
    const choice = await vscode.window.showWarningMessage(
      `This folder ('${folderName}') doesn't have the standard Lemonade src structure. Initialize it now?`,
      { modal: true },
      "Yes, Initialize",
    )

    if (choice === "Yes, Initialize") {
      try {
        await vscode.window.withProgress(
          {
            location: vscode.ProgressLocation.Notification,
            title: "Initializing Lemonade project...",
            cancellable: false,
          },
          async (progress) => {
            progress.report({ increment: 0 })
            await argon.init("default.project.json", "place", [])
            progress.report({ increment: 100 })
          },
        )

        const srcPath = path.join(workspaceRoot, "src")
        const projectPath = path.join(workspaceRoot, "default.project.json")
        if (fs.existsSync(srcPath) && fs.existsSync(projectPath)) {
          vscode.window.showInformationMessage(
            "Project initialized successfully.",
          )
        } else {
          const errorMsg = `Initialization verification failed: src or project file not found.`
          logger.error(errorMsg, false, true)
          return
        }
      } catch (initError) {
        const errorMsg =
          initError instanceof Error ? initError.message : String(initError)
        logger.error(`Project initialization failed: ${errorMsg}`, false, true)
        return
      }
    } else {
      return // User cancelled init
    }
  }

  // Structure exists OR was just successfully initialized
  try {
    const projectPath = path.join(workspaceRoot, "default.project.json")
    if (!fs.existsSync(projectPath)) {
      const errorMsg = `default.project.json not found in ${workspaceRoot}. Cannot start server.`
      logger.error(errorMsg, false, true)
      return
    }

    const host = config.defaultHost()
    const port = config.defaultPort()
    const options = ["--host", host, "--port", port.toString(), "--sourcemap"]

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Starting Lemonade server...",
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 })

          const [sessionId, actualAddress] = await argon.serve(
            projectPath,
            options,
          )

          progress.report({
            increment: 50,
            message: "Server started, launching Studio...",
          })

          if (!sessionId || !actualAddress) {
            const errorMsg =
              "No valid session ID or address returned from argon.serve."
            throw new Error(errorMsg)
          }

          // Directly attempt to launch Studio after server starts
          try {
            const studioMessage = `Lemonade server running on ${actualAddress}.`

            await argon.studio(false, undefined)

            vscode.window.showInformationMessage(
              `${studioMessage} Launching Studio...`,
            )
          } catch (launchError) {
            const errorMsg =
              launchError instanceof Error
                ? launchError.message
                : String(launchError)
            console.error("ERROR launching Roblox Studio:", launchError)
            logger.error(
              `Server running on ${actualAddress}, but failed to launch Studio: ${errorMsg}`,
              false,
              true,
            )
          }
          progress.report({ increment: 100 })
        },
      )
    } catch (serveError) {
      const errorMsg =
        serveError instanceof Error ? serveError.message : String(serveError)
      console.error(
        "[Lemonade] ERROR: Caught error in server start block:",
        serveError,
      )
      logger.error(`Failed to start Lemonade server: ${errorMsg}`, false, true)
    }
  } catch (outerError) {
    const errorMsg =
      outerError instanceof Error ? outerError.message : String(outerError)
    console.error("[Lemonade] ERROR: Caught error in outer block:", outerError)
    logger.error(`Failed unexpectedly: ${errorMsg}`, false, true)
  }
}
