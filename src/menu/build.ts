import * as vscode from 'vscode'
import * as argon from '../argon'
import { getProjectName } from '../util'
import { Item, getProject } from '.'
import { State } from '../state'
import { Session } from '../session'

export const item: Item = {
  label: '$(file-binary) Build',
  description: 'Compile project to binary or XML',
  action: 'build',
}

function getOutput(name: string): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        title: 'Enter build output',
        placeHolder: `${name}.rbxl`,
        value: name,
      })
      .then((output) => {
        if (!output) {
          return reject()
        }

        resolve(output === name ? undefined : output)
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
        label: 'Generate sourcemap',
        flag: '--sourcemap',
        id: 'sourcemap',
        picked: true,
      },
      {
        label: 'Build plugin',
        flag: '--plugin',
        id: 'plugin',
        picked: false,
      },
      {
        label: 'Use XML format',
        flag: '--xml',
        id: 'xml',
        picked: false,
      },
      {
        label: 'Use roblox-ts',
        flag: '--ts',
        id: 'tsMode',
        picked: false,
      },
    ]

    options.forEach((option) => {
      option['picked'] = context.globalState.get(option.id, option.picked)
    })

    vscode.window
      .showQuickPick(options, {
        title: 'Select build options',
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

  const name = getProjectName(project)
  const output = await getOutput(name)

  const options = await getOptions(state.context)

  if (output) {
    options.push(`--output ${output}`)
  }

  const id = await argon.build(project, options)

  if (id) {
    const session = new Session(name, project, id).withType('Build')
    state.addSession(session)
  }
}
