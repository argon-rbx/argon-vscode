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
import { RestorableSession, Session } from "./session"

let state: State

export async function activate(context: vscode.ExtensionContext) {
  console.log("Argon activated")

  if (!installer.verify()) {
    logger.info("Installing Argon...")

    try {
      await installer.install()
    } catch (err) {
      logger.error(`Argon failed to install: ${err}`)
      return
    }
  }

  argon.update(true)

  state = new State(context, getVersion())

  Object.values(commands).forEach((command) => {
    context.subscriptions.push(command(state))
  })

  state.show()

  if (config.autoRun()) {
    const session = new RestorableSession(
      context.workspaceState.get("lastSession"),
    )

    if (session.isRestorable()) {
      menu.restoreSession(session, state)

      if (config.autoLaunchStudio()) {
        argon.studio(true)
      }
    }
  }

  completion.start()
}

export function deactivate() {
  console.log("Argon deactivating")
  state.cleanup()
}
