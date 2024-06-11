import { commands } from "vscode"
import { run } from "../menu/exec"

export function exec() {
  return commands.registerCommand("argon.exec", () => {
    run()
  })
}
