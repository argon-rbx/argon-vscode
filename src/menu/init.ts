import * as vscode from "vscode"
import * as path from "path"
import * as fs from "fs"
import * as argon from "../argon"
import { Item } from "."
import { getArgonPath } from "../util"

export const item: Item = {
  label: "$(file-add) Init",
  description: "Create a new project",
  action: "init",
}

const OPTIONS = [
  {
    label: "Include docs",
    flag: "--docs",
    picked: true,
  },
  {
    label: "Configure Git",
    flag: "--git",
    picked: true,
  },
  {
    label: "Setup Wally",
    flag: "--wally",
    picked: false,
  },
  {
    label: "Setup selene",
    flag: "--selene",
    picked: false,
  },
  {
    label: "Use roblox-ts",
    flag: "--ts",
    picked: false,
  },
]

function getProjectName(): Promise<string> {
  return new Promise((resolve, reject) => {
    vscode.window
      .showInputBox({
        title: "Enter project name",
        placeHolder: "default.project.json",
        value: "default",
      })
      .then((name) => {
        if (!name) {
          return reject()
        }

        resolve(name)
      })
  })
}

function getProjectTemplate(): Promise<string> {
  return new Promise((resolve, reject) => {
    const priority = ["place", "plugin", "package", "model", "quick"]

    const templates = fs
      .readdirSync(path.join(getArgonPath(), "templates"))
      .filter((name) => name !== ".DS_Store")
      .sort((a, b) => {
        const index1 = priority.indexOf(a)
        const index2 = priority.indexOf(b)

        return index1 === -1 ? 1 : index2 === -1 ? -1 : index1 - index2
      })
      .map((template) => {
        return {
          label: template.charAt(0).toUpperCase() + template.slice(1),
          description:
            template === "quick" ? "(Recommended for beginners)" : "",
          id: template,
        }
      })

    vscode.window
      .showQuickPick(templates, {
        title: "Select project template",
      })
      .then((template) => {
        if (!template) {
          return reject()
        }

        resolve(template.id)
      })
  })
}

function getProjectOptions(
  context: vscode.ExtensionContext,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    OPTIONS.forEach((option) => {
      option["picked"] = context.globalState.get(
        "Init" + option.flag,
        option.picked,
      )
    })

    vscode.window
      .showQuickPick(OPTIONS, {
        title: "Select project options",
        canPickMany: true,
      })
      .then((items) => {
        if (!items) {
          return reject()
        }

        OPTIONS.forEach((item) => {
          context.globalState.update(
            "Init" + item.flag,
            items.some((i) => i.flag === item.flag),
          )
        })

        resolve(items.map((item) => item.flag))
      })
  })
}

export async function run(context: vscode.ExtensionContext) {
  let name = await getProjectName()
  const template = await getProjectTemplate()

  const selectedOptions = await getProjectOptions(context)
  const options: string[] = []

  OPTIONS.forEach((option) => {
    options.push(`${option.flag}=${selectedOptions.includes(option.flag)}`)
  })

  if (!name.endsWith(".project.json")) {
    name += ".project.json"
  }

  argon.init(name, template, options)

  return name
}
