import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as argon from '../argon'
import { Item } from '.'
import { getArgonPath } from '../util'

export const item: Item = {
  label: '$(file-add) Init',
  description: 'Create a new project',
  action: 'init',
}

function getProjectName(then: (name: string) => void) {
  const quickPick = vscode.window.createQuickPick()
  quickPick.title = 'Enter project name'
  quickPick.placeholder = 'default.project.json'
  quickPick.value = 'default'
  quickPick.show()

  quickPick.onDidAccept(() => {
    then(quickPick.value)
    quickPick.hide()
  })
}

function getProjectTemplate(then: (template: string) => void) {
  const priority = ['place', 'plugin', 'package', 'model']

  let templates = fs
    .readdirSync(path.join(getArgonPath(), 'templates'))
    .sort((a, b) => {
      let index1 = priority.indexOf(a)
      let index2 = priority.indexOf(b)

      return index1 === -1 ? 1 : index2 === -1 ? -1 : index1 - index2
    })
    .map((template) => {
      return {
        label: template.charAt(0).toUpperCase() + template.slice(1),
        id: template,
      }
    })

  vscode.window
    .showQuickPick(templates, {
      title: 'Select project template',
    })
    .then((template) => {
      if (!template) {
        return then('place')
      }

      then(template.id)
    })
}

function getProjectOptions(
  context: vscode.ExtensionContext,
  then: (options: string[]) => void,
) {
  const options = [
    {
      label: 'Include docs',
      flag: '--docs',
      id: 'includeDocs',
      picked: true,
    },
    {
      label: 'Configure Git',
      flag: '--git',
      id: 'useGit',
      picked: true,
    },
    {
      label: 'Setup Wally',
      flag: '--wally',
      id: 'useWally',
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
      title: 'Select project options',
      canPickMany: true,
    })
    .then((items) => {
      if (!items) {
        return then([])
      }

      options.forEach((item) => {
        if (items.find((i) => i.id === item.id)) {
          context.globalState.update(item.id, true)
        } else {
          context.globalState.update(item.id, false)
        }
      })

      then(items.map((item) => item.flag))
    })
}

export function handler(context: vscode.ExtensionContext) {
  getProjectName((name) => {
    getProjectTemplate((template) => {
      getProjectOptions(context, (options) => {
        if (!name.endsWith('.project.json')) {
          name += '.project.json'
        }

        argon.init(name, template, options)
      })
    })
  })
}
