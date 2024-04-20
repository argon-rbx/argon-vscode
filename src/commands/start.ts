import { commands } from 'vscode'
import * as argon from '../argon'

export function start() {
  return commands.registerCommand('argon.start', () => {
    argon.debug('start')
  })
}
