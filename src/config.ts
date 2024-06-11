import { workspace } from "vscode"

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

export function verbose(): boolean {
  return config().get("verbose")!
}
