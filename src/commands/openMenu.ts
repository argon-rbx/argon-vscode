import * as vscode from 'vscode'
import * as menu from '../menu'
import * as logger from '../logger'
import { State } from '../state'

export function openMenu(state: State) {
  return vscode.commands.registerCommand('argon.openMenu', () => {
    const quickPick = vscode.window.createQuickPick()

    quickPick.title = 'Argon'
    quickPick.items = menu.items()

    quickPick.onDidAccept(async () => {
      const item = quickPick.selectedItems[0] as menu.Item

      try {
        await menu.onDidAccept(item.action, state.context)
      } catch (err) {
        if (err) {
          logger.error(`Failed to run command: ${err}`)
        }
      }

      quickPick.dispose()
    })

    quickPick.show()
  })
}
