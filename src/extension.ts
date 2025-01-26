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

let state: State

export async function activate(context: vscode.ExtensionContext) {
  console.log("Argon activated")

  updatePathVariable()

  let version = getVersion()

  if (version) {
    argon.update("all", true)
  } else {
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
