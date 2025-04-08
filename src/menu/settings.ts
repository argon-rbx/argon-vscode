/* // Commented out to disable this menu item
import * as vscode from "vscode"
// import { Item } from "."
import { loadGlobalConfig } from "../config"

export const item: Item = {
  label: "$(settings) Settings",
  description: "Make Lemonade your own", // Changed Argon to Lemonade
  action: "settings",
}

export function run() {
  loadGlobalConfig() // Keep functionality, just disable item

  vscode.commands.executeCommand(
    "workbench.action.openSettings",
    "@ext:dervex.argon", // Note: Extension ID might need changing separately if publishing
  )
}
*/
