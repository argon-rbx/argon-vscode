import * as vscode from 'vscode'
import * as argon from './argon'
import { Session } from './session'

export class State {
  private item: vscode.StatusBarItem
  private sessions: Session[] = []

  public context: vscode.ExtensionContext
  public version: string

  public constructor(context: vscode.ExtensionContext, version: string) {
    this.context = context
    this.version = version

    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      -420,
    )
  }

  public show() {
    this.item.command = 'argon.openMenu'
    this.item.text = '$(argon-logo) Argon'
    this.item.tooltip = 'No running sessions'
    this.item.show()
  }

  public addSession(session: Session) {
    this.sessions.push(session)
    this.updateItem()
  }

  public removeSession(id: number) {
    this.sessions = this.sessions.filter((session) => session.id !== id)
    this.updateItem()
  }

  public getSessions() {
    return [...this.sessions]
  }

  public cleanup() {
    this.sessions.forEach((session) => {
      console.log(`Stopping session ${session.id}...`)
      argon.stop(session.id)
    })
  }

  private updateItem() {
    const sessionCount = this.sessions.length

    this.item.text =
      sessionCount === 0
        ? '$(argon-logo) Argon'
        : `$(argon-logo) Argon (${sessionCount})`

    const tooltip = new vscode.MarkdownString()

    this.sessions.forEach((session) => {
      tooltip.appendMarkdown(`## ${session.name}\n`)

      tooltip.appendCodeblock(`Type: ${session.type}\n`)
      tooltip.appendCodeblock(`File: ${session.project}\n`)

      if (session.address) {
        tooltip.appendCodeblock(`Address: ${session.address}\n`)
      }

      tooltip.appendMarkdown('---\n')
    })

    if (sessionCount === 0) {
      this.item.tooltip = 'No running sessions'
    } else {
      this.item.tooltip = tooltip
    }
  }
}
