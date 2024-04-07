import * as vscode from 'vscode'
import * as argon from '../argon'
import { State } from '../state'

export function run(_state: State) {
  return vscode.commands.registerCommand('argon.run', () => {
    argon.debug('run')
  })
}
