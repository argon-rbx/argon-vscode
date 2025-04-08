import { commands } from "vscode"
// import { run } from "../menu/exec" // Commented out as menu/exec.ts is disabled

export function exec() {
  return commands.registerCommand("argon.exec", () => {
    // run() // Also comment out the call
    // TODO: Decide if this command registration should be removed entirely
  })
}
