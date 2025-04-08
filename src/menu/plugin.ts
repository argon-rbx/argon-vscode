/* // Commented out to disable this menu item
import * as vscode from "vscode"
import * as argon from "../argon"
// import { Item } from "."

export const item: Item = {
  label: "$(plug) Plugin",
  description: "Install or uninstall Lemonade plugin for Roblox Studio", // Changed Argon to Lemonade
  action: "plugin",
}

function getMode(): Promise<argon.PluginMode> {
  return new Promise((resolve, reject) => {
    const items: { label: string; mode: argon.PluginMode }[] = [
      {
        label: "$(arrow-down) Install",
        mode: "install",
      },
      {
        label: "$(x) Uninstall",
        mode: "uninstall",
      },
    ]

    vscode.window
      .showQuickPick(items, {
        title: "Select command mode",
      })
      .then((mode) => {
        if (!mode) {
          return reject()
        }

        resolve(mode.mode)
      })
  })
}

export async function run() {
  argon.plugin(await getMode())
}
*/
