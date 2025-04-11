import * as argon from "../argon"
import { Item } from "."

export const item: Item = {
  label: "$(refresh) Update Lemonade",
  description: "Update CLI and plugin components",
  action: "update",
}

export function run(): Promise<void> {
  return argon.update("all", false)
}
