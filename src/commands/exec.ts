import { commands } from 'vscode'
import { handler } from '../menu/exec'

export function exec() {
  return commands.registerCommand('argon.exec', () => {
    handler()
  })
}
