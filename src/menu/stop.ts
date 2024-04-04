import * as vscode from 'vscode'
import { Item } from '.'

export const item: Item = {
  label: '$(stop) Stop',
  description: 'Stop running Argon instances',
  action: 'stop',
}

export function handler() {}
