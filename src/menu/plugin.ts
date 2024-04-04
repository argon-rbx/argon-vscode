import * as argon from '../argon'
import { Item } from '.'

export const item: Item = {
  label: '$(plug) Plugin',
  description: 'Install Argon plugin for Roblox Studio locally',
  action: 'plugin',
}

export function handler() {
  argon.plugin()
}
