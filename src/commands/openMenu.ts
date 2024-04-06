import * as vscode from 'vscode'
import * as menu from '../menu'
import * as logger from '../logger'
import { State } from '../state'

export function openMenu(state: State) {
  return vscode.commands.registerCommand('argon.openMenu', () => {
    const items = menu.items()
    const quickPick = vscode.window
      .showQuickPick(items, {
        title: 'Argon',
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
