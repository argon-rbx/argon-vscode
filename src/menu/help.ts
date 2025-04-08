import * as vscode from "vscode"
import { Item } from "."

export const item: Item = {
  label: "$(question) Help",
  description: "Visit official Lemonade website",
  action: "help",
}

export function run() {
  vscode.env.openExternal(vscode.Uri.parse("https://argon.wiki"))
}
