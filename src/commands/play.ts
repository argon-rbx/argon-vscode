import * as vscode from 'vscode'
import * as argon from '../argon'

export function play() {
  return vscode.commands.registerCommand('argon.play', () => {
    argon.debug('play')
  })
}
