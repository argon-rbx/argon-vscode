import * as init from './init'
import * as vscode from 'vscode'
import * as util from '../util'

export interface Item {
  label: string
  description: string
  kind?: vscode.QuickPickItemKind
  action: string
}

function verify() {
  if (!util.getCurrentDir()) {
    throw new Error(
      'No workspace folder open! Please open one before running this command again',
    )
  }
}

export function items(): Item[] {
  return [init.item]
}

export function onDidAccept(action: string, context: vscode.ExtensionContext) {
  switch (action) {
    case 'init':
      verify()
      init.handler(context)
      break
  }
}
