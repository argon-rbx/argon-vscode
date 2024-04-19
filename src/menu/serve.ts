import * as vscode from 'vscode'
import * as argon from '../argon'
import { getProjectName } from '../util'
import { Item, getProject } from '.'
import { State } from '../state'
import { Session } from '../session'

export const item: Item = {
  label: '$(rss) Serve',
  description: 'Sync with Roblox Studio',
  action: 'serve',
}

function getAddress(): Promise<{
  host: string | undefined
  port: string | undefined
}> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        title: 'Enter full address or part of it',
        placeHolder: 'localhost:8000',
        value: '8000',
      })
      .then((address) => {
        if (!address) {
          return reject()
        }

        const comps = address.split(':')

        if (comps.length === 1) {
          const comp = comps[0]

          if (isNaN(Number(comp))) {
            resolve({
              host: comp,
              port: undefined,
            })
          } else {
            resolve({
              host: undefined,
              port: comp,
            })
          }
        } else {
          resolve({
            host: comps[0],
            port: comps[1],
          })
        }
      })
  })
}

function getOptions(
  context: vscode.ExtensionContext,
): Promise<[string[], boolean]> {
  return new Promise((resolve, reject) => {
    const options = [
      {
        label: 'Generate sourcemap',
        flag: '--sourcemap',
        id: 'sourcemap',
        picked: true,
      },
      {
        label: 'Use roblox-ts',
        flag: '--ts',
        id: 'tsMode',
        picked: false,
      },
      {
        label: 'Customize address',
        id: 'customAddress',
        picked: false,
      },
    ]

    options.forEach((option) => {
      option['picked'] = context.globalState.get(option.id, option.picked)
    })

    vscode.window
      .showQuickPick(options, {
        title: 'Select serve options',
        canPickMany: true,
      })
      .then(async (items) => {
        if (!items) {
          return reject()
        }

        options.forEach((item) => {
          context.globalState.update(
            item.id,
            items.find((i) => i.id === item.id) !== undefined,
          )
        })

        resolve([
          items.flatMap((item) => (item.flag ? [item.flag] : [])),
          items.find((item) => item.id === 'customAddress') !== undefined,
        ])
      })
  })
}

export async function handler(state: State) {
  const project = await getProject(state.context, true)

  const [options, customAddress] = await getOptions(state.context)
  const address = {
    host: 'localhost',
    port: '8000',
  }

  if (customAddress) {
    const custom = await getAddress()

    if (custom.host) {
      options.push('--host ' + custom.host)
      address.host = custom.host
    }

    if (custom.port) {
      options.push('--port ' + custom.port)
      address.port = custom.port
    }
  }

  const name = getProjectName(project)
  const [id, message] = await argon.serve(project, options)

  if (message.includes('already in use')) {
    address.port = message.match(/\d+/g)?.[1]!
  }

  const session = new Session(name, project, id).withAddress(
    `${address.host}:${address.port}`,
  )

  state.addSession(session)
}
