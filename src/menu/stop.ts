import * as vscode from 'vscode'
import * as argon from '../argon'
import { Item } from '.'
import { State } from '../state'

export const item: Item = {
  label: '$(stop) Stop',
  description: 'Stop running Argon instances',
  action: 'stop',
}

export function handler(state: State) {
  let items = state.getSessions().map((session) => {
    return { label: session.project, id: session.id }
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
        return
      }

      if (item.id === 0) {
        items.forEach((item) => {
          if (item.id !== 0) {
            state.removeSession(item.id)
            argon.stop(item.id)
          }
        })
      } else {
        state.removeSession(item.id)
        argon.stop(item.id)
      }
    })
}
