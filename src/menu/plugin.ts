import * as vscode from "vscode"
import * as argon from "../argon"
import { Item } from "."

export const item: Item = {
  label: "$(plug) Plugin",
  description: "Install or uninstall Argon plugin for Roblox Studio",
  action: "plugin",
}

function getMode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const items = [
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
