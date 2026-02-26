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

const ERROR_MESSAGE =
  "Try running VS Code as an administrator or restarting your computer.\
 If the issue persists make sure your PATH variable is valid and points to the Argon CLI binary!"

let state: State

export async function activate(context: vscode.ExtensionContext) {
  console.log("Argon activated")

  updatePathVariable()

  let version = undefined
  try {
    version = getVersion()
  } catch {}

  if (version && config.autoUpdate()) {
    argon.update("all", true)
  } else if (!version) {
    try {
      await installer.install()
      version = getVersion()
    } catch (err) {
      return openMenuError(
        context,
        `Failed to install: ${err}. ${ERROR_MESSAGE}`,
      )
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
          menu.restoreSession(session, state)

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
