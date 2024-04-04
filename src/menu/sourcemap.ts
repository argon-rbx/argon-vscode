import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(file-code) Sourcemap',
  description: 'Map project files into JSON file',
  action: 'sourcemap',
}

export function handler() {}
