import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(settings) Settings',
  description: 'Make Argon your own',
  action: 'settings',
}

export function run() {
  vscode.commands.executeCommand(
    'workbench.action.openSettings',
    '@ext:dervex.argon',
  )
}
