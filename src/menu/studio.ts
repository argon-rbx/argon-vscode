import * as argon from '../argon'
import { Item } from '.'

export const item: Item = {
  label: '$(empty-window) Studio',
  description: 'Launch new Roblox Studio instance',
  action: 'studio',
}

export function handler() {
  argon.studio()
}
