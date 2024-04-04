import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(question) Help',
  description: 'Visit official Argon website',
  action: 'help',
}

export function handler() {
  vscode.env.openExternal(vscode.Uri.parse('https://argon.wiki'))
}
