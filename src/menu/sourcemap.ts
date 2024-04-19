import * as vscode from 'vscode'
import * as argon from '../argon'
import { getProjectName } from '../util'
import { Item, getProject } from '.'
import { State } from '../state'
import { Session } from '../session'

export const item: Item = {
  label: '$(file-code) Sourcemap',
  description: 'Map project files into JSON file',
  action: 'sourcemap',
}

function getOutput(): Promise<string> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        title: 'Enter sourcemap output',
        placeHolder: 'sourcemap.json',
        value: 'sourcemap',
      })
      .then((output) => {
        if (!output) {
          return reject()
        }

        resolve(output.endsWith('.json') ? output : `${output}.json`)
      })
  })
}

function getOptions(context: vscode.ExtensionContext): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const options = [
      {
        label: 'Watch for changes',
        flag: '--watch',
        id: 'watch',
        picked: true,
      },
      {
        label: 'Include non-scripts',
        flag: '--non-scripts',
        id: 'nonScripts',
        picked: false,
      },
    ]

    options.forEach((option) => {
      option['picked'] = context.globalState.get(option.id, option.picked)
    })

    vscode.window
      .showQuickPick(options, {
        title: 'Select sourcemap options',
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

        resolve(items.map((item) => item.flag))
      })
  })
}

export async function handler(state: State) {
  const project = await getProject(state.context)

  const output = await getOutput()

  const options = await getOptions(state.context)
  options.push(`--output ${output}`)

  const name = getProjectName(project)
  const id = await argon.sourcemap(project, options)

  if (id) {
    const session = new Session(name, project, id).withType('Sourcemap')
    state.addSession(session)
  }
}
