import { workspace } from 'vscode'

function config() {
  return workspace.getConfiguration('argon')
}

export function autoRun(): boolean {
  return config().get('autoRun')!
}

export function hideNotifications(): boolean {
  return config().get('hideNotifications')!
}

export function defaultHost(): string {
  return config().get('defaultHost')!
}

export function defaultPort(): number {
  return config().get('defaultPort')!
}
