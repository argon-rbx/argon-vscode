import * as vscode from "vscode"
import * as argon from "../argon"
import { Item } from "."

export const item: Item = {
  label: "$(sync) Update",
  description: "Manually check for Lemonade updates and install them",
  action: "update",
}

function getMode(): Promise<argon.UpdateMode> {
  return new Promise((resolve, reject) => {
    const items: { label: string; mode: argon.UpdateMode }[] = [
      {
        label: "$(check-all) All",
        mode: "all",
      },
      {
        label: "$(terminal) CLI",
        mode: "cli",
      },
      {
        label: "$(plug) Plugin",
        mode: "plugin",
      },
      {
        label: "$(folder) Templates",
        mode: "templates",
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
