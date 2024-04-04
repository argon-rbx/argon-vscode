import * as vscode from 'vscode'
import { Session } from './session'

export class State {
  private item: vscode.StatusBarItem
  private sessions: Session[] = []

  public context: vscode.ExtensionContext

  public constructor(context: vscode.ExtensionContext) {
    this.context = context
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -420,
    )
  }

  public show() {
    this.item.command = 'argon.openMenu'
    this.item.text = '$(argon-logo) Argon'
    this.item.show()
  }

  public cleanup() {
    this.sessions.forEach((session) => {
      console.log(session)
    })
  }
}
