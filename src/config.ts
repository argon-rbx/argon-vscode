import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import * as logger from "./logger"
import { workspace } from "vscode"

let loaded = false

function config() {
  return workspace.getConfiguration("argon")
}

export function autoRun(): boolean {
  return config().get("autoRun")!
}

export function autoLaunchStudio(): boolean {
  return config().get("autoLaunchStudio")!
}

export function focusStudio(): boolean {
  return config().get("focusStudio")!
}

export function notificationLevel(): number {
  switch (config().get("notificationLevel")) {
    case "Info":
      return 3
    case "Warning":
      return 2
    case "Error":
      return 1
    default:
      return 0
  }
}

export function defaultHost(): string {
  return config().get("defaultHost")!
}

export function defaultPort(): number {
  return config().get("defaultPort")!
}

export function customPath(): string {
  return config().get("customPath")!
}

export function verbose(): boolean {
  return config().get("verbose")!
}

export async function loadGlobalConfig() {
  try {
    const configPath = path.join(os.homedir(), ".argon", "config.toml")

    if (!fs.existsSync(configPath)) {
      loaded = true
      return
    }

    const contents = fs.readFileSync(configPath, "utf-8").split("\n")
    const globalConfig: Record<string, string> = {}

    for (const line of contents) {
      const parts = line.split("=", 2)

      if (parts.length !== 2 || line.startsWith("#")) {
        continue
      }

      const key = parts[0].trim()
      const value = parts[1].trim().replaceAll('"', "")

      globalConfig[key] = value
    }

    config().update("globalConfig", globalConfig, true)
  } catch (err) {
    logger.warn(`Failed to load global config: ${err}`)
  }

  loaded = true
}

export async function saveGlobalConfig() {
  if (!loaded) {
    return
  }

  try {
    const configPath = path.join(os.homedir(), ".argon", "config.toml")
    const globalConfig = config().get("globalConfig")!

    const contents =
      Object.entries(globalConfig)
        .map(([key, value]) => {
          if (isNaN(Number(value)) && value !== "true" && value !== "false") {
            value = `"${value}"`
          }

          return `${key} = ${value}`
        })
        .join("\n") + "\n"

    fs.writeFileSync(configPath, contents)
  } catch (err) {
    logger.error(`Failed to save global config: ${err}`)
  }
}
