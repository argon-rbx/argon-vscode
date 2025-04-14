import { commands } from "vscode"
import * as argon from "../argon"
import { updateExtension } from "../extension"

export function update() {
  return commands.registerCommand("argon.update", async () => {
    // Update CLI, plugin and templates (but not vscode since we'll handle that separately)
    await argon.update("cli", false)
    await argon.update("plugin", false)
    await argon.update("templates", false)

    // Then try to update the extension itself
    await updateExtension()
  })
}
