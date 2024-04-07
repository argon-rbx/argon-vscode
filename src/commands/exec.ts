import * as vscode from 'vscode'
import { handler } from '../menu/exec'
import { State } from '../state'

export function exec(_state: State) {
  return vscode.commands.registerCommand('argon.exec', () => {
    handler()
  })
}
