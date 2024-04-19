import * as vscode from 'vscode'
import * as commands from './commands'
import * as installer from './installer'
import * as logger from './logger'
import { getVersion } from './util'
import { State } from './state'

let state: State

export async function activate(context: vscode.ExtensionContext) {
  console.log('Argon activated')

  if (!installer.verify()) {
    logger.info('Installing Argon...')

    try {
      await installer.install()
    } catch (err) {
      logger.error(`Argon failed to install: ${err}`)
      return
    }
  }

  state = new State(context, getVersion())

  Object.values(commands).forEach((command) => {
    context.subscriptions.push(command(state))
  })

  state.show()
}

export function deactivate() {
  console.log('Argon deactivating')
  state.cleanup()
}
