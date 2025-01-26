import * as vscode from "vscode"
import * as menu from "../menu"
import * as logger from "../logger"
import { State } from "../state"

export function openMenu(state: State) {
  return vscode.commands.registerCommand("argon.openMenu", () => {
    vscode.window
      .showQuickPick(menu.items(), {
        title: "Argon " + state.version,
      })
      .then(async (item) => {
        if (!item) {
          return
        }

        item = item as menu.Item

        try {
          await menu.onDidAccept(item.action, state)
        } catch (err) {
          if (err) {
            logger.error(`Failed to run command: ${err}`)
          }
        }
      })
  })
}

export function openMenuError(context: vscode.ExtensionContext, err: string) {
  logger.error(err, false, true)

  context.subscriptions.push(
    vscode.commands.registerCommand("argon.openMenu", () => {
      logger.error(err, false, true)

      vscode.window.showQuickPick(
        [
          {
            label: "$(warning) Critical error occurred!",
            description: "See the error message for more details",
          },
        ],
        { title: "Argon" },
      )
    }),
  )
}
