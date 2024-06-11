import { commands } from "vscode"
import * as argon from "../argon"

export function stop() {
  return commands.registerCommand("argon.stop", () => {
    argon.debug("stop")
  })
}
