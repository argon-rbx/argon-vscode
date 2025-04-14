import * as vscode from "vscode"
import * as commands from "./commands"
import * as installer from "./installer"
import * as config from "./config"
import * as argon from "./argon"
import * as menu from "./menu"
import * as completion from "./completion"
import { updatePathVariable, getVersion } from "./util"
import { State } from "./state"
import { RestorableSession } from "./session"
import { openMenuError } from "./commands/openMenu"
import * as path from "path"
import * as fs from "fs"
import * as https from "https"
import * as http from "http"
import * as os from "os"
import * as childProcess from "child_process"

let state: State

// Self-update the extension from GitHub releases
async function updateExtension(): Promise<boolean> {
  // Get current extension info
  const extension = vscode.extensions.getExtension("lemonade-labs.argon")
  if (!extension) {return false}

  const currentVersion = extension.packageJSON.version
  console.log(`Current extension version: ${currentVersion}`)

  try {
    // Get latest extension info from GitHub
    const extensionInfo = await getLatestExtensionInfo()
    if (!extensionInfo || !extensionInfo.version || !extensionInfo.url) {
      console.log("Could not get latest extension information")
      return false
    }

    console.log(`Latest extension version: ${extensionInfo.version}`)
    if (extensionInfo.version === currentVersion) {
      console.log("Extension is up to date")
      return false
    }

    // Ask for confirmation
    const update = await vscode.window.showInformationMessage(
      `A new version of Lemonade (${extensionInfo.version}) is available. Update extension?`,
      "Update",
      "Later",
    )

    if (update !== "Update") {return false}

    // Show progress during download and installation
    return await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Updating Lemonade extension to ${extensionInfo.version}`,
        cancellable: false,
      },
      async (progress) => {
        // Download the VSIX file
        progress.report({ message: "Downloading update..." })
        const vsixPath = await downloadFile(
          extensionInfo.url,
          path.join(os.tmpdir(), `argon-${extensionInfo.version}.vsix`),
        )

        if (!vsixPath) {
          vscode.window.showErrorMessage("Failed to download extension update")
          return false
        }

        // Install the VSIX
        progress.report({ message: "Installing update..." })
        const installed = await installVsix(vsixPath)

        if (installed) {
          await vscode.window
            .showInformationMessage(
              `Lemonade updated to version ${extensionInfo.version}. Please reload VS Code.`,
              "Reload Now",
            )
            .then((choice) => {
              if (choice === "Reload Now") {
                vscode.commands.executeCommand("workbench.action.reloadWindow")
              }
            })
          return true
        } else {
          vscode.window.showErrorMessage("Failed to install extension update")
          return false
        }
      },
    )
  } catch (error) {
    console.error("Extension update error:", error)
    return false
  }
}

// Get latest extension information from repo
async function getLatestExtensionInfo(): Promise<{
  version: string
  url: string
} | null> {
  return new Promise((resolve) => {
    const url = "https://api.github.com/repos/LupaHQ/argon/releases/latest"

    const req = https.get(
      url,
      {
        headers: { "User-Agent": "VS Code Argon Extension" },
      },
      (res) => {
        let data = ""
        res.on("data", (chunk) => {
          data += chunk
        })
        res.on("end", () => {
          try {
            const release = JSON.parse(data)
            // Look for the VSIX asset
            const vsixAsset = release.assets.find(
              (asset: any) =>
                asset.name.endsWith(".vsix") && asset.name.includes("argon"),
            )

            if (vsixAsset) {
              resolve({
                version: release.tag_name.replace(/^v/, ""),
                url: vsixAsset.browser_download_url,
              })
            } else {
              resolve(null)
            }
          } catch (e) {
            console.error("Failed to parse release info:", e)
            resolve(null)
          }
        })
      },
    )

    req.on("error", (e) => {
      console.error("Failed to get latest release:", e)
      resolve(null)
    })

    req.end()
  })
}

// Download file from URL
async function downloadFile(
  url: string,
  destPath: string,
): Promise<string | null> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath)

    const request = url.startsWith("https") ? https.get(url) : http.get(url)

    request.on("response", (response: http.IncomingMessage) => {
      if (response.statusCode !== 200) {
        console.error(`Download failed: ${response.statusCode}`)
        file.close()
        fs.unlink(destPath, () => {})
        resolve(null)
        return
      }

      response.pipe(file)
    })

    file.on("finish", () => {
      file.close()
      resolve(destPath)
    })

    request.on("error", (err: Error) => {
      console.error("Download error:", err)
      file.close()
      fs.unlink(destPath, () => {})
      resolve(null)
    })

    file.on("error", (err) => {
      console.error("File error:", err)
      file.close()
      fs.unlink(destPath, () => {})
      resolve(null)
    })

    request.end()
  })
}

// Install VSIX file
async function installVsix(vsixPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const cmd =
      process.platform === "win32"
        ? `"${process.execPath}" --install-extension "${vsixPath}"`
        : `"${process.execPath}" --install-extension "${vsixPath}"`

    childProcess.exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Install error:", error)
        console.error("stderr:", stderr)
        resolve(false)
        return
      }

      console.log("VSIX installation output:", stdout)
      resolve(true)
    })
  })
}

// Export the updateExtension function to be used in commands
export { updateExtension }

export async function activate(context: vscode.ExtensionContext) {
  console.log("Argon activated")

  updatePathVariable()

  let version = getVersion()

  if (version && config.autoUpdate()) {
    // Update CLI, plugin and templates components first
    argon.update("cli", true)
    argon.update("plugin", true)
    argon.update("templates", true)

    // Then check for extension updates
    await updateExtension()
  } else if (!version) {
    try {
      await installer.install()
      version = getVersion()

      if (!version) {
        throw new Error(
          "Try running VS Code as an administrator or restarting your computer!",
        )
      }
    } catch (err) {
      return openMenuError(context, `Argon failed to install: ${err}`)
    }
  }

  state = new State(context, version)

  Object.values(commands).forEach((command) => {
    context.subscriptions.push(command(state))
  })

  state.show()

  if (config.autoRun()) {
    const lastSessions = context.workspaceState.get("lastSessions")

    if (Array.isArray(lastSessions)) {
      for (const lastSession of lastSessions) {
        const session = new RestorableSession(lastSession)

        if (session.isRestorable()) {
          menu.restoreSession()

          if (session.needsStudio() && config.autoLaunchStudio()) {
            argon.studio(true)
          }
        }
      }
    }
  }

  completion.start()
  config.loadGlobalConfig()

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("argon.globalConfig")) {
      config.saveGlobalConfig()
    }
  })
}

export function deactivate() {
  console.log("Argon deactivating")

  if (state) {
    state.cleanup()
  }
}
