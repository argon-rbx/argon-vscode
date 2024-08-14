import * as vscode from "vscode"
import * as commands from "./commands"
import * as installer from "./installer"
import * as logger from "./logger"
import * as config from "./config"
import * as argon from "./argon"
import * as menu from "./menu"
import * as completion from "./completion"
import { getVersion } from "./util"
import { State } from "./state"
import { RestorableSession } from "./session"
import { openMenuError } from "./commands/openMenu"

let state: State

export async function activate(context: vscode.ExtensionContext) {
  console.log("Argon activated")

  switch (installer.verify()) {
    case "Installed":
      // Do nothing
      break

    case "NotInstalled":
      logger.info("Installing Argon...")

      try {
        await installer.install()
      } catch (err) {
        return openMenuError(context, `Argon failed to install: ${err}`)
      }

      break

    case "Unknown":
      return openMenuError(
        context,
        "Argon failed to install because custom path is set. Please install Argon manually or remove the custom path",
      )
  }

  argon.update("both", true)

  state = new State(context, getVersion())

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
