import { window } from 'vscode'
import * as config from './config'

const outputChannel = window.createOutputChannel('Argon')
outputChannel.appendLine('Argon started')

function beautify(message: string): string {
  const index = message.indexOf(':')

  // Remove Argon CLI log prefix
  if (index <= 5) {
    message = message.substring(index + 1)
  }

  return 'Argon: ' + message
}

function shouldShow(silent?: boolean): boolean {
  if (silent) {
    return false
  }

  return !config.hideNotifications()
}

export function info(message: string, silent?: boolean) {
  outputChannel.appendLine(message)

  if (shouldShow(silent)) {
    window.showInformationMessage(beautify(message))
  }
}

export function warn(message: string, silent?: boolean) {
  outputChannel.appendLine(message)

  if (shouldShow(silent)) {
    window.showWarningMessage(beautify(message))
  }
}

export function error(message: string, silent?: boolean) {
  outputChannel.appendLine(message)

  if (shouldShow(silent)) {
    window.showErrorMessage(beautify(message))
  }
}
