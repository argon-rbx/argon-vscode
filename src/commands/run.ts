import * as vscode from 'vscode'
import * as argon from '../argon'

export function run() {
  return vscode.commands.registerCommand('argon.run', () => {
    argon.debug('run')
  })
}
