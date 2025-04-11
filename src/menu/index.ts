import * as vscode from "vscode"
// Removing unused imports
// import { getCurrentDir, findProjects } from "../util"
import { State } from "../state"
// import { RestorableSession } from "../session"

import * as startLemonade from "./startLemonade"
// Keep other imports commented for context
// import * as init from "./init"
// import * as serve from "./serve"
// import * as build from "./build"
// import * as sourcemap from "./sourcemap"
// import * as stop from "./stop"
// import * as exec from "./exec"
// import * as debug from "./debug"
// import * as studio from "./studio"
import * as update from "./update"
// import * as help from "./help"
// import * as output from "./output"
// import * as settings from "./settings"

export interface Item {
  label: string
  description: string
  action: string
}

export interface Divider {
  label: string
  kind: vscode.QuickPickItemKind
}

export function items(): (Item | Divider)[] {
  return [
    startLemonade.item,
    update.item
  ]
}

export async function onDidAccept(action: string, state: State) {
  switch (action) {
    case "startLemonade":
      await startLemonade.run(state, state.context)
      break;
    case "update":
      await update.run()
      break;
    // No other cases needed as other items are disabled
  }
}

export async function restoreSession() {
  /* session: RestorableSession, */
  /* state: State, */
  // Functionality commented out/removed, keep stub
}

// Keep findProjects as it might be used internally by commented code
// Keep getCurrentDir as it's used by startLemonade
// Remove getProject function if it's defined here
