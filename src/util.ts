import * as vscode from "vscode"
import * as path from "path"
import * as os from "os"
import * as fs from "fs"
import * as childProcess from "child_process"
import * as logger from "./logger"

export function getArgonPath(): string {
  return path.join(os.homedir(), ".argon")
}

export function getCurrentDir(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
}

export function findProjects(placesOnly?: boolean): string[] {
  const dir = getCurrentDir()

  if (!dir) {
    throw new Error("Cannot find projects without a workspace folder open!")
  }

  let projects = fs
    .readdirSync(dir)
    .filter(
      (entry) =>
        entry.endsWith(".project.json") &&
        fs.statSync(path.join(dir, entry)).isFile(),
    )

  if (placesOnly) {
    projects = projects.filter((project) => {
      try {
        var tree = JSON.parse(
          fs.readFileSync(path.join(dir, project), "utf8"),
        ).tree
      } catch (err) {
        logger.error(`Failed to parse ${project}: ${err}`)
        return false
      }

      if (!tree) {
        return false
      }

      return tree["$className"] === "DataModel"
    })
  }

  return projects
}

export function findPlaces(): string[] {
  const dir = getCurrentDir()

  if (!dir) {
    throw new Error("Cannot find places without a workspace folder open!")
  }

  let places = fs
    .readdirSync(dir)
    .filter(
      (entry) =>
        (entry.endsWith(".rbxl") || entry.endsWith(".rbxlx")) &&
        fs.statSync(path.join(dir, entry)).isFile(),
    )

  return places
}

export function getProjectName(project: string): string {
  if (!path.isAbsolute(project)) {
    const dir = getCurrentDir()

    if (!dir) {
      throw new Error(
        "Cannot get project name without a workspace folder open!",
      )
    }

    project = path.join(dir, project)
  }

  try {
    return JSON.parse(fs.readFileSync(project, "utf8")).name
  } catch {
    return path.basename(project, ".project.json")
  }
}

export function getProjectAddress(project: string): {
  host?: string
  port?: string
} {
  if (!path.isAbsolute(project)) {
    const dir = getCurrentDir()

    if (!dir) {
      throw new Error(
        "Cannot get project name without a workspace folder open!",
      )
    }

    project = path.join(dir, project)
  }

  try {
    var json = JSON.parse(fs.readFileSync(project, "utf8"))
  } catch {
    return {}
  }

  return {
    host: json.host || json.serveAddress,
    port: json.port || json.servePort,
  }
}

export function getVersion(): string | undefined {
  try {
    return childProcess
      .execSync(`argon --version`)
      .toString()
      .replace("argon-rbx ", "")
      .trim()
  } catch {}
}

export function updatePathVariable() {
  if (os.platform() !== "win32") {
    // Skip registry operations on non-Windows platforms
    return
  }

  try {
    // Use fully qualified path to reg.exe instead of relying on PATH
    const regExePath = path.join(
      process.env.SystemRoot || "C:\\Windows",
      "System32",
      "reg.exe",
    )

    let paths = childProcess
      .execSync(
        `"${regExePath}" query "HKEY_CURRENT_USER\\Environment" /v PATH`,
      )
      .toString()

    const index = paths.indexOf("_SZ")

    if (index !== -1) {
      paths = paths.substring(index + 3)
    }

    process.env.PATH = paths.trim()
  } catch (err) {
    logger.error(`Failed to update PATH: ${err}`)
    // Continue without updating PATH - better than crashing
  }
}
