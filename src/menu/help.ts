/* // Commented out to disable this menu item
import * as vscode from "vscode"
// import { Item } from "."

export const item: Item = {
  label: "$(question) Help",
  description: "Visit official Lemonade website", // Changed Argon to Lemonade
  action: "help",
}

export function run() {
  vscode.env.openExternal(vscode.Uri.parse("https://argon.wiki")) // Keep functionality, just disable item
}
*/
