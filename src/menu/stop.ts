/* // Commented out to disable this menu item
import * as vscode from "vscode"
import * as argon from "../argon"
import { Item } from "."
import { State } from "../state"

export const item: Item = {
  label: "$(stop) Stop",
  description: "Stop running Argon sessions",
  action: "stop",
}

export async function run(state: State): Promise<void> {
  return new Promise((resolve, reject) => {
    const items = state.getSessions().map((session) => {
      if (session.type === "Serve") {
        const address = session.address?.replace("localhost:", "")
        var label = `${session.project} [${session.type} - ${address}]`
      } else {
        var label = `${session.project} [${session.type}]`
      }

      return { label, id: session.id }
    })

    if (items.length === 0) {
      return vscode.window.showQuickPick([], {
        title: "No sessions to stop",
      })
    } else if (items.length === 1) {
      const ids = items.map((item) => item.id)

      argon.stop(ids)
      state.removeSessions(ids)

      return resolve()
    }

    vscode.window
      .showQuickPick(items, {
        title: "Select a session to stop",
        canPickMany: true,
      })
      .then((item: any) => {
        if (!item) {
          return reject()
        }

        if (Array.isArray(item)) {
          var items = item
        } else {
          var items = [item]
        }

        const ids = items.map((item) => item.id)

        if (ids.length !== 0) {
          argon.stop(ids)
          state.removeSessions(ids)
        }

        resolve()
      })
  })
}
*/
