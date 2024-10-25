import * as vscode from "vscode"
import * as argon from "../argon"
import * as config from "../config"
import { getProjectAddress, getProjectName } from "../util"
import { Item, getProject } from "."
import { State } from "../state"
import { RestorableSession, Session } from "../session"

export const item: Item = {
  label: "$(rss) Serve",
  description: "Live Sync with Roblox Studio",
  action: "serve",
}

const OPTIONS = [
  {
    label: "Generate sourcemap",
    flag: "--sourcemap",
    picked: true,
  },
  {
    label: "Use roblox-ts",
    flag: "--ts",
    picked: false,
  },
  {
    label: "Customize address",
    flag: "customAddress",
    picked: false,
  },
]

function getAddress(): Promise<{
  host?: string
  port?: string
}> {
  return new Promise((resolve, reject) => {
    const host = config.defaultHost()
    const port = config.defaultPort().toString()

    vscode.window
      .showInputBox({
        title: "Enter full address or part of it",
        placeHolder: `${host}:${port}`,
        value: port,
      })
      .then((address) => {
        if (!address) {
          return reject()
        }

        const comps = address.split(":")

        if (comps.length === 1) {
          const comp = comps[0]

          if (isNaN(Number(comp))) {
            resolve({
              host: comp,
              port: undefined,
            })
          } else {
            resolve({
              host: undefined,
              port: comp,
            })
          }
        } else {
          resolve({
            host: comps[0],
            port: comps[1],
          })
        }
      })
  })
}

function getOptions(
  context: vscode.ExtensionContext,
  restore: boolean,
): Promise<[string[], boolean]> {
  return new Promise((resolve, reject) => {
    OPTIONS.forEach((option) => {
      option["picked"] = context.globalState.get(
        "Serve" + option.flag,
        option.picked,
      )
    })

    if (restore) {
      return resolve([
        OPTIONS.flatMap((option) =>
          option.flag !== "customAddress" && option.picked ? [option.flag] : [],
        ),
        false,
      ])
    }

    vscode.window
      .showQuickPick(OPTIONS, {
        title: "Select serve options",
        canPickMany: true,
      })
      .then(async (items) => {
        if (!items) {
          return reject()
        }

        OPTIONS.forEach((item) => {
          context.globalState.update(
            "Serve" + item.flag,
            items.some((i) => i.flag === item.flag),
          )
        })

        resolve([
          items.flatMap((item) =>
            item.flag !== "customAddress" ? [item.flag] : [],
          ),
          items.some((item) => item.flag === "customAddress"),
        ])
      })
  })
}

export async function run(state: State, session?: RestorableSession) {
  const restore = !!session

  if (!restore) {
    var project = await getProject(state.context, true)
    var address = getProjectAddress(project)
  } else {
    var project = session.project

    const sessionAddress = session.address?.split(":") || []

    var address: { host?: string; port?: string } = {
      host: sessionAddress[0],
      port: session.originalPort
        ? String(session.originalPort)
        : sessionAddress[1],
    }
  }

  const [options, promptAddress] = await getOptions(state.context, restore)

  if (promptAddress) {
    const customAddress = await getAddress()

    if (customAddress.host) {
      address.host = customAddress.host
    }

    if (customAddress.port) {
      address.port = customAddress.port
    }
  }

  address.host = address.host || config.defaultHost()
  address.port = address.port || config.defaultPort().toString()

  options.push("--host", address.host)
  options.push("--port", address.port)

  const name = getProjectName(project)
  const [id, message] = await argon.serve(project, options)
  let originalPort

  if (message.includes("already in use")) {
    originalPort = Number(address.port)
    address.port = message.match(/\d+/g)?.[1]!
  }

  state.addSession(
    new Session(name, project, id).withAddress(
      `${address.host}:${address.port}`,
      originalPort,
    ),
  )
}
