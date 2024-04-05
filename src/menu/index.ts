import * as vscode from 'vscode'
import * as util from '../util'
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
import * as settings from './settings'
import * as help from './help'

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
  if (!util.getCurrentDir()) {
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
    init.item,
    serve.item,
    build.item,
    sourcemap.item,
    stop.item,
    helpers(),
    exec.item,
    debug.item,
    studio.item,
    plugin.item,
    misc(),
    settings.item,
    help.item,
  ]
}

export async function onDidAccept(action: string, state: State) {
  switch (action) {
    case 'init':
      verify()
      await init.handler(state.context)
      break
    case 'serve':
      verify()
      await serve.handler(state)
      break
    case 'build':
      verify()
      build.handler()
      break
    case 'sourcemap':
      verify()
      sourcemap.handler()
      break
    case 'stop':
      stop.handler()
      break

    case 'exec':
      exec.handler()
      break
    case 'debug':
      debug.handler()
      break
    case 'studio':
      studio.handler()
      break
    case 'plugin':
      plugin.handler()
      break

    case 'settings':
      settings.handler()
      break
    case 'help':
      help.handler()
      break
  }
}
