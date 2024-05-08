import * as vscode from 'vscode'
import * as argon from '../argon'
import { getProjectName } from '../util'
import { Item, getProject } from '.'
import { State } from '../state'
import { RestorableSession, Session } from '../session'

export const item: Item = {
  label: '$(file-code) Sourcemap',
  description: 'Map project files into JSON file',
  action: 'sourcemap',
}

const OPTIONS = [
  {
    label: 'Watch for changes',
    flag: '--watch',
    picked: true,
  },
  {
    label: 'Include non-scripts',
    flag: '--non-scripts',
    picked: false,
  },
]

function getOutput(restore: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    if (restore) {
      return resolve('sourcemap.json')
    }

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

function getOptions(
  context: vscode.ExtensionContext,
  restore: boolean,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    OPTIONS.forEach((option) => {
      option['picked'] = context.globalState.get(
        'Sourcemap' + option.flag,
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
        title: 'Select sourcemap options',
        canPickMany: true,
      })
      .then(async (items) => {
        if (!items) {
          return reject()
        }

        OPTIONS.forEach((item) => {
          context.globalState.update(
            'Sourcemap' + item.flag,
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

  const output = await getOutput(restore)
  const options = await getOptions(state.context, restore)
  options.push('--output', output)

  const name = getProjectName(project)
  const id = await argon.sourcemap(project, options)

  if (id) {
    const session = new Session(name, project, id).withType('Sourcemap')
    state.addSession(session)
  }
}
