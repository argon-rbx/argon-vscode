import * as vscode from 'vscode'
import * as argon from '../argon'
import { findPlaces } from '../util'
import { Item } from '.'

export const item: Item = {
  label: '$(empty-window) Studio',
  description: 'Launch new Roblox Studio instance',
  action: 'studio',
}

function getPlace(): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    const places = findPlaces()
    places.unshift('$(window) Launch empty')

    vscode.window
      .showQuickPick(places, {
        title: 'Select a place',
      })
      .then(async (place) => {
        if (!place) {
          return reject()
        }

        place.endsWith('.rbxl') || place.endsWith('.rbxlx')
          ? resolve(place)
          : resolve(undefined)
      })
  })
}

export async function run() {
  const place = await getPlace()

  argon.studio(false, place)
}
