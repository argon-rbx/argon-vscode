import * as vscode from "vscode"

const SETTINGS = [
  {
    field: "host",
    value: 'host = "${1:localhost}"',
    doc: "Default server host name",
  },
  {
    field: "port",
    value: "port = ${1:8000}",
    doc: "Default server port number",
  },
  {
    field: "template",
    value: 'template = "${1|place,plugin,package,model,quick|}"',
    doc: "Default project template (place, model, etc.)",
  },
  {
    field: "license",
    value:
      'license = "${1|Apache-2.0,AFL-3.0,Artistic-2.0,BSL-1.0,BSD-2-Clause,BSD-3-Clause,BSD-3-Clause-Clear,BSD-4-Clause,0BSD,CC,CC0-1.0,CC-BY-4.0,CC-BY-SA-4.0,WTFPL,ECL-2.0,EPL-1.0,EPL-2.0,EUPL-1.1,AGPL-3.0,GPL,GPL-2.0,GPL-3.0,LGPL,LGPL-2.1,LGPL-3.0,ISC,LPPL-1.3c,MS-PL,MIT,MPL-2.0,OSL-3.0,PostgreSQL,OFL-1.1,NCSA,Unlicense,Zlib|}"',
    doc: "Default project license (SPDX identifier)",
  },
  {
    field: "include_docs",
    value: "include_docs = ${1|true,false|}",
    doc: "Include documentation in the project (README, CHANGELOG, etc.)",
  },
  {
    field: "use_git",
    value: "use_git = ${1|true,false|}",
    doc: "Use git for source control",
  },
  {
    field: "use_wally",
    value: "use_wally = ${1|false,true|}",
    doc: "Use Wally for package management",
  },
  {
    field: "run_async",
    value: "run_async = ${1|false,true|}",
    doc: "Run Argon asynchronously, freeing up the terminal",
  },
  {
    field: "scan_ports",
    value: "scan_ports = ${1|true,false|}",
    doc: "Scan for the first available port if selected one is in use",
  },
  {
    field: "detect_project",
    value: "detect_project = ${1|true,false|}",
    doc: "Automatically detect project type",
  },
  {
    field: "with_sourcemap",
    value: "with_sourcemap = ${1|false,true|}",
    doc: "Always run commands with sourcemap generation",
  },
  {
    field: "build_xml",
    value: "build_xml = ${1|false,true|}",
    doc: "Build using XML format by default",
  },
  {
    field: "check_updates",
    value: "check_updates = ${1|true,false|}",
    doc: "Check for new Argon releases on startup",
  },
  {
    field: "auto_update",
    value: "auto_update = ${1|false,true|}",
    doc: "Automatically install Argon updates if available",
  },
  {
    field: "install_plugin",
    value: "install_plugin = ${1|true,false|}",
    doc: "Install Roblox plugin locally and keep it updated",
  },
  {
    field: "rojo_mode",
    value: "rojo_mode = ${1|false,true|}",
    doc: "Use Rojo namespace by default",
  },
  {
    field: "ts_mode",
    value: "ts_mode = ${1|false,true|}",
    doc: "Use roblox-ts by default",
  },
  {
    field: "relative_paths",
    value: "relative_paths = ${1|false,true|}",
    doc: "Work on relative paths instead of absolute ones",
  },
  {
    field: "move_to_bin",
    value: "move_to_bin = ${1|false,true|}",
    doc: "Move files to the bin instead of deleting them (two-way sync)",
  },
  {
    field: "share_stats",
    value: "share_stats = ${1|true,false|}",
    doc: "Share anonymous Argon usage statistics with the community",
  },
]

export function start() {
  const selector: vscode.DocumentSelector = {
    language: "toml",
    scheme: "file",
    pattern: "**/.argon/config.toml",
  }

  vscode.languages.registerCompletionItemProvider(selector, {
    provideCompletionItems() {
      return SETTINGS.map((setting) => {
        const item = new vscode.CompletionItem(
          setting.field,
          vscode.CompletionItemKind.Field,
        )

        item.insertText = new vscode.SnippetString(setting.value)
        item.documentation = new vscode.MarkdownString(setting.doc)

        return item
      })
    },
  })
}
