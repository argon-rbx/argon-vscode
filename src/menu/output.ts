import * as vscode from "vscode"
import { Item } from "."
import { outputChannel } from "../logger"

export const item: Item = {
  label: "$(output) Output",
  description: "Go to the Argon output channel",
  action: "output",
}

export function run() {
  outputChannel.show()
}
