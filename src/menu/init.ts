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

function getProjectName(): Promise<string> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        title: 'Enter project name',
        placeHolder: 'default.project.json',
        value: 'default',
      })
      .then((name) => {
        if (!name) {
          return reject()
        }

        resolve(name)
      })
  })
}

function getProjectTemplate(): Promise<string> {
  return new Promise((resolve, reject) => {
    const priority = ['place', 'plugin', 'package', 'model', 'quick']

    const templates = fs
      .readdirSync(path.join(getArgonPath(), 'templates'))
      .filter((name) => name !== '.DS_Store')
      .sort((a, b) => {
        const index1 = priority.indexOf(a)
        const index2 = priority.indexOf(b)

        return index1 === -1 ? 1 : index2 === -1 ? -1 : index1 - index2
      })
      .map((template) => {
        return {
          label: template.charAt(0).toUpperCase() + template.slice(1),
          description:
            template === 'quick' ? '(Recommended for beginners)' : '',
          id: template,
        }
      })

    vscode.window
      .showQuickPick(templates, {
        title: 'Select project template',
      })
      .then((template) => {
        if (!template) {
          return reject()
        }

        resolve(template.id)
      })
  })
}

function getProjectOptions(
  context: vscode.ExtensionContext,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
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

export async function handler(context: vscode.ExtensionContext) {
  let name = await getProjectName()
  const template = await getProjectTemplate()
  const options = await getProjectOptions(context)

  if (!name.endsWith('.project.json')) {
    name += '.project.json'
  }

  argon.init(name, template, options)

  return name
}
