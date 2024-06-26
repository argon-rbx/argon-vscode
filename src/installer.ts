import * as os from "os"
import * as fs from "fs"
import * as path from "path"
import * as childProcess from "child_process"
import { downloadRelease } from "@terascope/fetch-github-release"

function getArgonPath(): string {
  return (
    path.join(os.homedir(), ".argon", "bin", "argon") +
    (os.platform() === "win32" ? ".exe" : "")
  )
}

export function verify(): boolean {
  return fs.existsSync(getArgonPath())
}

export async function install() {
  const argonPath = getArgonPath()
  let versionIndex = 0

  fs.mkdirSync(path.dirname(argonPath), { recursive: true })

  await downloadRelease(
    "argon-rbx",
    "argon",
    path.dirname(argonPath),
    undefined,
    (asset) => {
      if (versionIndex > 1) {
        throw new Error(
          `Your OS or CPU architecture is not yet supported by Argon! (${os.platform()} ${os.arch()})`,
        )
      }

      if (asset.name.endsWith("linux-x86_64.zip")) {
        versionIndex++
      }

      const platform = os
        .platform()
        .replace("darwin", "macos")
        .replace("win32", "windows")

      const arch =
        os.platform() === "win32"
          ? "x86_64"
          : os.arch().replace("x64", "x86_64").replace("arm64", "aarch64")

      return asset.name.includes(platform) && asset.name.includes(arch)
    },
  )

  // Trigger Argon installer
  childProcess.execFileSync(argonPath, ["--version"])
}
