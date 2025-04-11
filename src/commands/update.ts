import { commands } from "vscode"
import * as argon from "../argon"

export function update() {
  return commands.registerCommand("argon.update", () => {
    argon.update("all", false)
  })
}
