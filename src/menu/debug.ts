import * as vscode from 'vscode'
import * as argon from '../argon'
import { Item } from '.'

export const item: Item = {
  label: '$(debug) Debug',
  description: 'Switch to Roblox Studio and start playtest',
  action: 'debug',
}

function getMode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const items = [
      {
        label: '$(vm) Play',
        description: 'F5',
        mode: 'play',
      },
      {
        label: '$(server-environment) Run',
        description: 'F8',
        mode: 'run',
      },
      {
        label: '$(server) Start',
        description: 'F7',
        mode: 'start',
      },
      {
        label: '$(stop-circle) Stop',
        description: 'Shift + F5',
        mode: 'stop',
      },
    ]

    vscode.window
      .showQuickPick(items, {
        title: 'Select playtest mode',
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
  const mode = await getMode()

  argon.debug(mode)
}
