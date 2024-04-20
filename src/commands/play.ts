import { commands } from 'vscode'
import * as argon from '../argon'

export function play() {
  return commands.registerCommand('argon.play', () => {
    argon.debug('play')
  })
}
