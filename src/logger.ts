import * as vscode from 'vscode'

const outputChannel = vscode.window.createOutputChannel('Argon')
outputChannel.appendLine('Argon started')

function beautify(message: string) {
  return 'Argon: ' + message.substring(message.indexOf(':') + 1)
}

export function info(message: string, noNotification?: boolean) {
  outputChannel.appendLine(message)

  if (!noNotification) {
    vscode.window.showInformationMessage(beautify(message))
  }
}

export function warn(message: string, noNotification?: boolean) {
  outputChannel.appendLine(message)

  if (!noNotification) {
    vscode.window.showWarningMessage(beautify(message))
  }
}

export function error(message: string, noNotification?: boolean) {
  outputChannel.appendLine(message)

  if (!noNotification) {
    vscode.window.showErrorMessage(beautify(message))
  }
}
