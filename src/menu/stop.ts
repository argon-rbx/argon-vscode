import * as vscode from 'vscode'
import * as argon from '../argon'
import { Item } from '.'
import { State } from '../state'

export const item: Item = {
  label: '$(stop) Stop',
  description: 'Stop running Argon instances',
  action: 'stop',
}

export async function handler(state: State): Promise<void> {
  return new Promise((resolve, reject) => {
    const items = state.getSessions().map((session) => {
      return { label: `${session.project} [${session.type}]`, id: session.id }
    })

    if (items.length === 0) {
      return vscode.window.showQuickPick([], {
        title: 'No sessions to stop',
      })
    }

    items.push({ label: '$(x)Stop all', id: 0 })

    vscode.window
      .showQuickPick(items, {
        title: 'Select a session to stop',
      })
      .then((item) => {
        if (!item) {
          return reject()
        }

        if (item.id === 0) {
          const ids = state
            .getSessions()
            .map((session) => session.id)
            .filter((id) => id !== 0)

          argon.stop(ids)

          ids.forEach((id) => {
            state.removeSession(id)
          })
        } else {
          state.removeSession(item.id)
          argon.stop(item.id)
        }

        resolve()
      })
  })
}
