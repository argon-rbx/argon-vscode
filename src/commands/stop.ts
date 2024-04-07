import * as vscode from 'vscode'
import * as argon from '../argon'
import { State } from '../state'

export function stop(_state: State) {
  return vscode.commands.registerCommand('argon.stop', () => {
    argon.debug('stop')
  })
}
