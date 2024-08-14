import * as vscode from "vscode"
import { Item } from "."
import { loadGlobalConfig } from "../config"

export const item: Item = {
  label: "$(settings) Settings",
  description: "Make Argon your own",
  action: "settings",
}

export function run() {
  loadGlobalConfig()

  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "@ext:dervex.argon",
  )
}
