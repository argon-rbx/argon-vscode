import * as argon from '../argon'
import { Item } from '.'

export const item: Item = {
  label: '$(sync) Update',
  description: 'Manually check for Argon updates and install them',
  action: 'update',
}

export function handler() {
  argon.update()
}
