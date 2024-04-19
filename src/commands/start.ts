import * as vscode from 'vscode'
import * as argon from '../argon'

export function start() {
  return vscode.commands.registerCommand('argon.start', () => {
    argon.debug('start')
  })
}
