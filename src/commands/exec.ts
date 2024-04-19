import * as vscode from 'vscode'
import { handler } from '../menu/exec'

export function exec() {
  return vscode.commands.registerCommand('argon.exec', () => {
    handler()
  })
}
