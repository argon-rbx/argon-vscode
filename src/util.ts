import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'

export function getArgonPath(): string {
  return path.join(os.homedir(), '.argon')
}

export function getCurrentDir(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}
