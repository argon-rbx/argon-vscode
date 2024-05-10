# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), that adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.5] - 2024-05-10

### Fixed

- Hot fixed `Init` command, caused by broken flag parsing

## [2.0.4] - 2024-05-08

### Added

- It is now possible to open `.rbxl` pr `.rbxlx` file using `Studio` command
- Session restoring now supports `Build` and `Sourcemap` commands
- Completion for CLI global configuration (`**/.argon/config.toml`)

### Changed

- Last used command options are now saved separately from each command
- Reduced number of notifications by ignoring unimportant messages
- Minimum supported VS Code version is now `1.70.0`

### Fixed

## [2.0.3] - 2024-05-05

### Changed

- Made `Stop` command simpler when there is only one session running

## [2.0.2] - 2024-05-04

### Added

- `Update` command to manually check for Argon updates
- JSON schema for `*.model.json` files

### Changed

- Argon now checks for updates automatically every time you start extension
- `Init` command now overrides the global CLI config

## [2.0.1] - 2024-05-02

### Added

- Server address preview when running `Argon Stop`
- `Verbose` mode in the extension settings to enable easier debugging
- Option to uninstall Argon plugin

### Changed

- It is now possible to stop multiple Argon instances at once
- Argon CLI output is now captured in a better way proving more up to date info

## [2.0.0] - 2024-05-01

- Initial release

[unreleased]: https://github.com/argon-rbx/argon-vscode/compare/2.0.5...HEAD
[2.0.5]: https://github.com/argon-rbx/argon-vscode/compare/2.0.4...2.0.5
[2.0.4]: https://github.com/argon-rbx/argon-vscode/compare/2.0.3...2.0.4
[2.0.3]: https://github.com/argon-rbx/argon-vscode/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/argon-rbx/argon-vscode/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/argon-rbx/argon-vscode/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/argon-rbx/argon-vscode/compare/87f2daec9b41b73676470d5eab01fe2fdc129cc8...2.0.0
