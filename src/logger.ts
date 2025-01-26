import { window } from "vscode"
import * as config from "./config"

const outputChannel = window.createOutputChannel("Argon")
outputChannel.appendLine("Argon started")

function beautify(message: string): string {
  const index = message.indexOf(":")

  // Remove Argon CLI log prefix
  if (index <= 5) {
    message = message.substring(index + 1)
  }

  return "Argon: " + message
}

export function info(message: string, silent?: boolean) {
  outputChannel.appendLine(message)

  if (silent || config.notificationLevel() < 3) {
    return
  }

  window.showInformationMessage(beautify(message))
}

export function warn(message: string, silent?: boolean) {
  outputChannel.appendLine(message)

  if (silent || config.notificationLevel() < 2) {
    return
  }

  window.showWarningMessage(beautify(message))
}

export function error(message: string, silent?: boolean, bypass?: boolean) {
  outputChannel.appendLine(message)

  if ((silent || config.notificationLevel() < 1) && !bypass) {
    return
  }

  window.showErrorMessage(beautify(message), "Show Output").then((action) => {
    if (action === "Show Output") {
      outputChannel.show()
    }
  })
}
