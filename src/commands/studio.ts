import { commands } from "vscode"
import * as argon from "../argon"

export function studio() {
  return commands.registerCommand("argon.studio", () => {
    argon.studio(false, undefined)
  })
}
