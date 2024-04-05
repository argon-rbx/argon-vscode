import * as vscode from 'vscode'
import * as argon from '../argon'
import * as util from '../util'
import * as init from './init'
import { Item } from '.'
import { State } from '../state'

export const item: Item = {
  label: '$(rss) Serve',
  description: 'Sync with Roblox Studio',
  action: 'serve',
}

function getProject(): Promise<string> {
  return new Promise((resolve, reject) => {
    const projects = util.findProjects()
    projects.push('$(plus) Create new project')

    vscode.window
      .showQuickPick(projects, {
        title: 'Select a project',
      })
      .then(async (project) => {
        if (!project) {
          return reject()
        }

        resolve(project)
      })
  })
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

        let comps = address.split(':')

        if (comps.length === 1) {
          let comp = comps[0]

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

function getOptions(context: vscode.ExtensionContext): Promise<string[]> {
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
        title: 'Select project options',
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

        const selectedOptions = items
          .filter((item) => item.flag !== undefined)
          .map((item) => item.flag)

        if (items.find((item) => item.id === 'customAddress')) {
          const address = await getAddress()

          if (address.host) {
            selectedOptions.push('--host ' + address.host)
          }

          if (address.port) {
            selectedOptions.push('--port ' + address.port)
          }
        }

        resolve(
          // @ts-ignore
          selectedOptions,
        )
      })
  })
}

export async function handler(state: State) {
  let project = await getProject()

  if (!project.endsWith('.project.json')) {
    project = await init.handler(state.context)
  }

  const options = await getOptions(state.context)

  let process = argon.serve(project, options)
}
