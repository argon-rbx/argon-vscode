import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(file-binary) Build',
  description: 'Compile project to binary or XML',
  action: 'build',
}

export function handler() {}
