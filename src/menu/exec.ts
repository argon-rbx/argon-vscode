import * as vscode from 'vscode'
import * as argon from '../argon'
import * as config from '../config'
import { Item } from '.'

export const item: Item = {
  label: '$(run-all) Exec',
  description: 'Run code snippet or file in Roblox Studio',
  action: 'exec',
}

export function handler() {
  if (!vscode.window.activeTextEditor) {
    return
  }

  const selection = vscode.window.activeTextEditor.document.getText(
    vscode.window.activeTextEditor.selection,
  )

  const focus = config.focusStudio()

  if (selection) {
    argon.exec(selection, focus)
  } else {
    argon.exec(vscode.window.activeTextEditor.document.uri.fsPath, focus)
  }
}
