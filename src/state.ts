import * as vscode from "vscode"
import * as argon from "./argon"
import * as logger from "./logger"
import { Session } from "./session"

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
    this.item.command = "argon.openMenu"
    this.item.text = "$(argon-logo) Argon"
    this.item.tooltip = "No running sessions"
    this.item.show()
  }

  public addSession(session: Session) {
    if (this.sessions.find((s) => session.equals(s))) {
      logger.warn(
        `Session with type: ${session.type} and project: ${session.project} is already running. Ignore this message if this is desired behavior`,
      )
    }

    this.sessions.push(session)
    this.updateItem()

    this.context.workspaceState.update("lastSessions", this.sessions)
  }

  public removeSessions(ids: number[]) {
    const lastSessions = this.context.workspaceState.get("lastSessions")

    this.sessions = this.sessions.filter((session) => {
      const matches = ids.includes(session.id)

      if (matches && Array.isArray(lastSessions)) {
        const index = lastSessions.findIndex(
          (value: Session) => value === session,
        )
        if (index > -1) {
          lastSessions[index] = undefined
        }
      }

      return !matches
    })

    if (this.sessions.length === 0) {
      this.context.workspaceState.update("lastSessions", undefined)
    }

    this.updateItem()
  }

  public getSessions() {
    return [...this.sessions]
  }

  public cleanup() {
    const ids = this.sessions.map((session) => session.id)

    if (ids.length > 0) {
      console.log("Stopping running sessions: " + ids.join(", "))
      argon.stop(ids)
    }
  }

  private updateItem() {
    const sessionCount = this.sessions.length

    this.item.text =
      sessionCount === 0
        ? "$(argon-logo) Argon"
        : `$(argon-logo) Argon (${sessionCount})`

    const tooltip = new vscode.MarkdownString()

    this.sessions.forEach((session) => {
      tooltip.appendMarkdown(`## ${session.name}\n`)

      tooltip.appendCodeblock(`Type: ${session.type}\n`)
      tooltip.appendCodeblock(`File: ${session.project}\n`)

      if (session.address) {
        tooltip.appendCodeblock(`Address: ${session.address}\n`)
      }

      tooltip.appendMarkdown("---\n")
    })

    if (sessionCount === 0) {
      this.item.tooltip = "No running sessions"
    } else {
      this.item.tooltip = tooltip
    }
  }
}
