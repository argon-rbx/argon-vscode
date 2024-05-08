import * as vscode from 'vscode'
import { getCurrentDir, findProjects } from '../util'
import { State } from '../state'

import * as init from './init'
import * as serve from './serve'
import * as build from './build'
import * as sourcemap from './sourcemap'
import * as stop from './stop'
import * as exec from './exec'
import * as debug from './debug'
import * as studio from './studio'
import * as plugin from './plugin'
import * as update from './update'
import * as settings from './settings'
import * as help from './help'
import { RestorableSession, Session } from '../session'

export interface Item {
  label: string
  description: string
  action: string
}

export interface Divider {
  label: string
  kind: vscode.QuickPickItemKind
}

function verify() {
  if (!getCurrentDir()) {
    throw new Error(
      'No workspace folder open! Please open one before running this command again',
    )
  }
}

function general(): Divider {
  return {
    label: 'General',
    kind: vscode.QuickPickItemKind.Separator,
  }
}

function helpers(): Divider {
  return {
    label: 'Helpers',
    kind: vscode.QuickPickItemKind.Separator,
  }
}

function misc(): Divider {
  return {
    label: 'Misc',
    kind: vscode.QuickPickItemKind.Separator,
  }
}

export function items(): (Item | Divider)[] {
  return [
    general(),
    serve.item,
    build.item,
    sourcemap.item,
    init.item,
    stop.item,
    helpers(),
    debug.item,
    exec.item,
    studio.item,
    plugin.item,
    update.item,
    misc(),
    settings.item,
    help.item,
  ]
}

export async function onDidAccept(action: string, state: State) {
  switch (action) {
    case 'serve':
      verify()
      await serve.run(state)
      break
    case 'build':
      verify()
      await build.run(state)
      break
    case 'sourcemap':
      verify()
      await sourcemap.run(state)
      break
    case 'init':
      verify()
      await init.run(state.context)
      break
    case 'stop':
      await stop.run(state)
      break

    case 'debug':
      await debug.run()
      break
    case 'exec':
      exec.run()
      break
    case 'studio':
      await studio.run()
      break
    case 'plugin':
      await plugin.run()
      break
    case 'update':
      update.run()
      break

    case 'settings':
      settings.run()
      break
    case 'help':
      help.run()
      break
  }
}

export async function restoreSession(session: RestorableSession, state: State) {
  switch (session.type) {
    case 'Serve':
      await serve.run(state, session)
      break
    case 'Build':
      await build.run(state, session)
      break
    case 'Sourcemap':
      await sourcemap.run(state, session)
      break
  }
}

export function getProject(
  context: vscode.ExtensionContext,
  placeOnly?: boolean,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const projects = findProjects(placeOnly)
    projects.push('$(plus) Create new project')

    vscode.window
      .showQuickPick(projects, {
        title: 'Select a project',
      })
      .then(async (project) => {
        if (!project) {
          return reject()
        }

        resolve(project.endsWith('.project.json') ? project : init.run(context))
      })
  })
}
