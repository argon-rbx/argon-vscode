import * as vscode from 'vscode'
import * as argon from '../argon'
import { getProjectName } from '../util'
import { Item, getProject } from '.'
import { State } from '../state'
import { RestorableSession, Session } from '../session'

export const item: Item = {
  label: '$(file-binary) Build',
  description: 'Compile project to binary or XML',
  action: 'build',
}

const OPTIONS = [
  {
    label: 'Watch for changes',
    flag: '--watch',
    picked: true,
  },
  {
    label: 'Generate sourcemap',
    flag: '--sourcemap',
    picked: true,
  },
  {
    label: 'Build plugin',
    flag: '--plugin',
    picked: false,
  },
  {
    label: 'Use XML format',
    flag: '--xml',
    picked: false,
  },
  {
    label: 'Use roblox-ts',
    flag: '--ts',
    picked: false,
  },
]

function getOutput(
  name: string,
  restore: boolean,
): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    if (restore) {
      return resolve(undefined)
    }

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

function getOptions(
  context: vscode.ExtensionContext,
  restore: boolean,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    OPTIONS.forEach((option) => {
      option['picked'] = context.globalState.get(
        'Build' + option.flag,
        option.picked,
      )
    })

    if (restore) {
      return resolve(
        OPTIONS.flatMap((option) => (option.picked ? [option.flag] : [])),
      )
    }

    vscode.window
      .showQuickPick(OPTIONS, {
        title: 'Select build options',
        canPickMany: true,
      })
      .then(async (items) => {
        if (!items) {
          return reject()
        }

        OPTIONS.forEach((item) => {
          context.globalState.update(
            'Build' + item.flag,
            items.some((i) => i.flag === item.flag),
          )
        })

        resolve(items.map((item) => item.flag))
      })
  })
}

export async function run(state: State, session?: RestorableSession) {
  const restore = !!session

  if (!restore) {
    var project = await getProject(state.context)
  } else {
    var project = session.project
  }

  const name = getProjectName(project)
  const output = await getOutput(name, restore)
  const options = await getOptions(state.context, restore)

  if (output) {
    options.push('--output', output)
  }

  const id = await argon.build(project, options)

  if (id) {
    state.addSession(new Session(name, project, id).withType('Build'))
  }
}
