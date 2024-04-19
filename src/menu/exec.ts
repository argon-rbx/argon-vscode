import * as vscode from 'vscode'
import * as argon from '../argon'
import { Item } from '.'

export const item: Item = {
  label: '$(run-all) Exec',
  description: 'Run code snippet or file in Studio',
  action: 'exec',
}

export function handler() {
  if (!vscode.window.activeTextEditor) {
    return
  }

  const selection = vscode.window.activeTextEditor.document.getText(
    vscode.window.activeTextEditor.selection,
  )

  if (selection) {
    argon.exec(selection)
  } else {
    argon.exec(vscode.window.activeTextEditor.document.uri.fsPath)
  }
}
