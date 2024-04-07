import * as vscode from 'vscode'
import * as argon from '../argon'
import { State } from '../state'

export function start(_state: State) {
  return vscode.commands.registerCommand('argon.start', () => {
    argon.debug('start')
  })
}
