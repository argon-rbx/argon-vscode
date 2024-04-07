import * as vscode from 'vscode'
import * as argon from '../argon'
import { State } from '../state'

export function play(_state: State) {
  return vscode.commands.registerCommand('argon.play', () => {
    argon.debug('play')
  })
}
