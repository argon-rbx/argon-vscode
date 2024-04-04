import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(settings) Settings',
  description: 'Make Argon your own',
  action: 'settings',
}

export function handler() {
  vscode.commands.executeCommand(
    'workbench.action.openSettings',
    '@ext:dervex.argon',
  )
}
