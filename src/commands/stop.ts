import * as vscode from 'vscode'
import * as argon from '../argon'

export function stop() {
  return vscode.commands.registerCommand('argon.stop', () => {
    argon.debug('stop')
  })
}
