import * as vscode from 'vscode'
import * as argon from '../argon'
import * as config from '../config'
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
    const host = config.defaultHost()
    const port = config.defaultPort().toString()

    vscode.window
      .showInputBox({
        title: 'Enter full address or part of it',
        placeHolder: `${host}:${port}`,
        value: port,
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
  autoRun: boolean,
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

    if (autoRun) {
      return resolve([
        options.flatMap((option) =>
          option.flag && option.picked ? [option.flag] : [],
        ),
        false,
      ])
    }

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

export async function handler(state: State, project?: string) {
  const autoRun = project !== undefined

  project = project || (await getProject(state.context, true))

  const [options, customAddress] = await getOptions(state.context, autoRun)
  const address = {
    host: config.defaultHost(),
    port: config.defaultPort().toString(),
  }

  if (customAddress) {
    const custom = await getAddress()

    if (custom.host) {
      address.host = custom.host
    }

    if (custom.port) {
      address.port = custom.port
    }
  }

  options.push('--host', address.host)
  options.push('--port', address.port)

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
