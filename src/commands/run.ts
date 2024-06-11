import { commands } from "vscode"
import * as argon from "../argon"

export function run() {
  return commands.registerCommand("argon.run", () => {
    argon.debug("run")
  })
}
