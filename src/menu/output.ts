/* // Commented out to disable this menu item
import * as vscode from "vscode"
// import { Item } from "."
import { outputChannel } from "../logger"

export const item: Item = {
  label: "$(output) Output",
  description: "Go to the Lemonade output channel", // Changed Argon to Lemonade
  action: "output",
}

export function run() {
  outputChannel.show() // Keep functionality, just disable item
}
*/
