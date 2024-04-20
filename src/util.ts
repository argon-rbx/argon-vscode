import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as argon from './argon'

export function getArgonPath(): string {
  return path.join(os.homedir(), '.argon')
}

export function getCurrentDir(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}

export function findProjects(placesOnly?: boolean): string[] {
  const dir = getCurrentDir()

  if (!dir) {
    throw new Error('Cannot find projects without a workspace folder open!')
  }

  let projects = fs
    .readdirSync(dir)
    .filter(
      (entry) =>
        entry.endsWith('.project.json') &&
        fs.statSync(path.join(dir, entry)).isFile(),
    )

  if (placesOnly) {
    projects = projects.filter((project) => {
      const tree = JSON.parse(
        fs.readFileSync(path.join(dir, project), 'utf8'),
      ).tree

      if (!tree) {
        return false
      }

      return tree['$className'] === 'DataModel'
    })
  }

  return projects
}

export function getProjectName(project: string): string {
  if (!path.isAbsolute(project)) {
    const dir = getCurrentDir()

    if (!dir) {
      throw new Error(
        'Cannot get project name without a workspace folder open!',
      )
    }

    project = path.join(dir, project)
  }

  return JSON.parse(fs.readFileSync(project, 'utf8')).name
}

export function getVersion(): string {
  return argon.version().replace('argon ', '').trim()
}
