/* // Commented out to disable this menu item
import * as vscode from "vscode"
import * as argon from "../argon"
import * as config from "../config"
import { sep } from "path"
// import { Item } from "."

export const item: Item = {
  label: "$(run-all) Exec",
  description: "Run code snippet or file in Roblox Studio",
  action: "exec",
}

export function run() {
  if (!vscode.window.activeTextEditor) {
    return
  }

  const document = vscode.window.activeTextEditor.document
  const selection = document.getText(vscode.window.activeTextEditor.selection)

  const focus = config.focusStudio()

  if (selection) {
    argon.exec(selection, focus)
  } else {
    const path = document.uri.fsPath

    if (!path.includes(sep)) {
      argon.exec(document.getText(), focus)
      return
    }

    argon.exec(path, focus)
  }
}
*/
