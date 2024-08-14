import * as vscode from "vscode"
import * as argon from "../argon"
import { Item } from "."

export const item: Item = {
  label: "$(sync) Update",
  description: "Manually check for Argon updates and install them",
  action: "update",
}

function getMode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const items = [
      {
        label: "$(multiple-windows) Both",
        mode: "both",
      },
      {
        label: "$(terminal) CLI",
        mode: "cli",
      },
      {
        label: "$(plug) Plugin",
        mode: "plugin",
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
  argon.update(await getMode())
}
