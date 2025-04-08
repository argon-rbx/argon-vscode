import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"
import * as argon from "../argon"
import * as config from "../config"
import { getCurrentDir } from "../util"
import { State } from "../state"
import { Item } from "." // Import Item type from index

// TODO: Import necessary functions from serve, studio, init if needed, or use argon.ts directly

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

    // Check if all required directories exist within src
    return REQUIRED_SRC_DIRS.every((reqDir) => existingDirs.includes(reqDir))
  } catch (error) {
    vscode.window.showErrorMessage(
      `Error reading src directory: ${error instanceof Error ? error.message : String(error)}`,
    )
    return false
  }
}

export async function run(_state: State) {
  const workspaceRoot = getCurrentDir()
  if (!workspaceRoot) {
    vscode.window.showErrorMessage(
      "No workspace folder open. Please open your project folder.",
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
        vscode.window.showInformationMessage(
          "Initializing project structure...",
        )
        // Initialize in current directory, creating default.project.json
        await argon.init("default.project.json", "place", [])
        vscode.window.showInformationMessage("Initialization command finished.")

        // Verify creation after init finishes
        const srcPath = path.join(workspaceRoot, "src")
        const projectPath = path.join(workspaceRoot, "default.project.json")
        if (fs.existsSync(srcPath) && fs.existsSync(projectPath)) {
          vscode.window.showInformationMessage(
            "Verification: src and project file exist.",
          )
          // *** Important: Fall through to start server/studio after successful init ***
        } else {
          vscode.window.showErrorMessage(
            `Initialization verification failed: src or default.project.json not found.`,
          )
          return
        }
      } catch (initError) {
        vscode.window.showErrorMessage(
          `Project initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`,
        )
        return
      }
    } else {
      // User clicked Cancel or closed dialog
      return
    }
  }

  // Structure exists OR was just successfully initialized, proceed to start server
  try {
    vscode.window.showInformationMessage("Starting Lemonade server...")

    // 1. Start Server
    const projectPath = path.join(workspaceRoot, "default.project.json")
    if (!fs.existsSync(projectPath)) {
      vscode.window.showErrorMessage(
        `default.project.json not found in ${workspaceRoot}. Cannot start server.`,
      )
      return
    }

    const host = config.defaultHost()
    const port = config.defaultPort().toString()
    const options = ["--host", host, "--port", port]

    console.log("Attempting to start server...")
    const [id, message] = await argon.serve(projectPath, options)
    console.log("argon.serve finished. ID:", id, "Message:", message)

    let actualPort = port
    let originalPort

    if (message && message.includes("already in use")) {
      vscode.window.showWarningMessage(
        `Port ${port} already in use. Trying another...`,
      )
      originalPort = Number(port)
      actualPort = message.match(/\d+/g)?.[1] || port
      console.log("Port conflict handled. New port:", actualPort)
    }

    // --- CHANGE: Show message with button (using MessageItem) ---
    const openStudioItem: vscode.MessageItem = { title: "Open Roblox Studio" }
    const openStudioChoice = await vscode.window.showInformationMessage(
      `Lemonade server running on ${host}:${actualPort}.`,
      openStudioItem,
    )

    if (openStudioChoice?.title === openStudioItem.title) {
      // --- CHANGE: Execute registered command ---
      try {
        vscode.window.showInformationMessage(
          "Opening Roblox Studio via command...",
        )
        console.log("[Lemonade] STEP: Executing command argon.studio")
        await vscode.commands.executeCommand("argon.studio")
        console.log("[Lemonade] STEP: Command argon.studio finished.")
      } catch (studioError) {
        console.error(
          "[Lemonade] ERROR: Failed to execute argon.studio command:",
          studioError,
        )
        vscode.window.showErrorMessage(
          `Failed to open Roblox Studio via command: ${studioError instanceof Error ? studioError.message : String(studioError)}`,
        )
      }
      // --- END CHANGE ---
    }
    // --- END CHANGE ---

    // 2. Open Studio (REMOVED - Handled by button above)

    // Modify success message (REMOVED - Handled by button popup)
    // vscode.window.showInformationMessage(
    //   `Lemonade server running on ${host}:${actualPort}. Please open Roblox Studio manually to connect.`,
    // );
  } catch (error) {
    console.error("[Lemonade] ERROR: Caught error in main try block:", error)
    console.error("Error during server start or Studio launch:", error)
    vscode.window.showErrorMessage(
      `Failed to start Lemonade: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}
