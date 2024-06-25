import * as vscode from "vscode"

const SETTINGS = [
  {
    field: "host",
    value: '"${1:localhost}"',
    doc: "Default server host name",
  },
  {
    field: "port",
    value: "${1:8000}",
    doc: "Default server port number",
  },
  {
    field: "template",
    value: '"${1|place,plugin,package,model,quick|}"',
    doc: "Default project template (place, model, etc.)",
  },
  {
    field: "license",
    value:
      '"${1|Apache-2.0,AFL-3.0,Artistic-2.0,BSL-1.0,BSD-2-Clause,BSD-3-Clause,BSD-3-Clause-Clear,BSD-4-Clause,0BSD,CC,CC0-1.0,CC-BY-4.0,CC-BY-SA-4.0,WTFPL,ECL-2.0,EPL-1.0,EPL-2.0,EUPL-1.1,AGPL-3.0,GPL,GPL-2.0,GPL-3.0,LGPL,LGPL-2.1,LGPL-3.0,ISC,LPPL-1.3c,MS-PL,MIT,MPL-2.0,OSL-3.0,PostgreSQL,OFL-1.1,NCSA,Unlicense,Zlib|}"',
    doc: "Default project license (SPDX identifier)",
  },
  {
    field: "include_docs",
    value: "${1|true,false|}",
    doc: "Include documentation in the project (README, CHANGELOG, etc.)",
  },
  {
    field: "use_git",
    value: "${1|true,false|}",
    doc: "Use git for source control",
  },
  {
    field: "use_wally",
    value: "${1|false,true|}",
    doc: "Use Wally for package management",
  },
  {
    field: "run_async",
    value: "${1|false,true|}",
    doc: "Run Argon asynchronously, freeing up the terminal",
  },
  {
    field: "scan_ports",
    value: "${1|true,false|}",
    doc: "Scan for the first available port if selected one is in use",
  },
  {
    field: "detect_project",
    value: "${1|true,false|}",
    doc: "Automatically detect project type",
  },
  {
    field: "with_sourcemap",
    value: "${1|false,true|}",
    doc: "Always run commands with sourcemap generation",
  },
  {
    field: "build_xml",
    value: "${1|false,true|}",
    doc: "Build using XML format by default",
  },
  {
    field: "check_updates",
    value: "${1|true,false|}",
    doc: "Check for new Argon releases on startup",
  },
  {
    field: "auto_update",
    value: "${1|false,true|}",
    doc: "Automatically install Argon updates if available",
  },
  {
    field: "install_plugin",
    value: "${1|true,false|}",
    doc: "Install Roblox plugin locally and keep it updated",
  },
  {
    field: "rojo_mode",
    value: "${1|false,true|}",
    doc: "Use Rojo namespace by default",
  },
  {
    field: "ts_mode",
    value: "${1|false,true|}",
    doc: "Use roblox-ts by default",
  },
  {
    field: "package_manager",
    value: '"${1|bun,npm,pnpm,yarn|}"',
    doc: "Package manager to use when running roblox-ts scripts (npm, yarn, etc.)",
  },
  {
    field: "lua_extension",
    value: "${1|false,true|}",
    doc: "Use .lua file extension instead of .luau when writing scripts",
  },
  {
    field: "move_to_bin",
    value: "${1|false,true|}",
    doc: "Move files to the bin instead of deleting them (two-way sync)",
  },
  {
    field: "share_stats",
    value: "${1|true,false|}",
    doc: "Share anonymous Argon usage statistics with the community",
  },
]

function hasSetting(document: vscode.TextDocument, setting: string) {
  const text = document.getText()

  if (text.includes(setting)) {
    for (const line of text.split("\n")) {
      if (line.includes(setting)) {
        return !line.includes("#")
      }
    }
  }

  return false
}

export function start() {
  const selector: vscode.DocumentSelector = {
    language: "toml",
    scheme: "file",
    pattern: "**/.argon/config.toml",
  }

  vscode.languages.registerCompletionItemProvider(selector, {
    provideCompletionItems(document) {
      return SETTINGS.flatMap((setting) => {
        if (hasSetting(document, setting.field)) {
          return []
        }

        const item = new vscode.CompletionItem(
          setting.field,
          vscode.CompletionItemKind.Field,
        )

        item.insertText = new vscode.SnippetString(
          setting.field + " = " + setting.value,
        )
        item.documentation = new vscode.MarkdownString(setting.doc)

        return [item]
      })
    },
  })
}
