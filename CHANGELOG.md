# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), that adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `Setup selene` option when initializing a new project
- Completion for `use_selene`, `max_unsynced_changes` and `changes_threshold` settings

### Changed

- When restoring last session, the original port is used (if previously it was in use)

## [2.0.13] - 2024-09-11

### Added

- Proper support for custom Argon installations
- Completion for `line_ending` and `rename_instances` settings

### Fixed

- `Global Config` setting no longer shows as changed when it's empty

### Changed

- Removed `customPath` setting as it's no longer needed

## [2.0.12] - 2024-08-21

### Added

- Completion for new settings in Argon's global and workspace config

### Fixed

- Automatic updates on extension startup work again (`invalid value` error)

## [2.0.11] - 2024-08-18

### Added

- Completion for optional paths in projects and workspace config
- Support for refreshed CLI `update` command
- Setting sync with CLI's [global config](https://argon.wiki/docs/configuration#global-config)

## [2.0.10] - 2024-08-10

### Added

- Compatibility with Rojo's `serveAddress` and `servePort` project fields

### Fixed

- Parsing corrupted `project.json` files no longer makes some commands unusable

## [2.0.9] - 2024-08-09

### Added

- `AutoRun` option can now restore multiple sessions ([#28](https://github.com/argon-rbx/argon-vscode/pull/28))
- `CustomPath` setting which enables specifying custom Argon CLI installation path

### Fixed

- When critical error occurs, Argon will now display special menu instead of "command `argon.openMenu` not found"

## [2.0.8] - 2024-07-19

### Added

- Support for executing unsaved files without selection

### Changed

- Moved option to launch empty Roblox Studio instance to the end in `Studio` command

## [2.0.7] - 2024-06-25

### Added

- Automatic completion for `package_manager` setting

### Fixed

- Global configuration completion no longer suggests settings that already exist
- Argon no longer displays `npm` verbose information in notifications

## [2.0.6] - 2024-06-16

### Added

- Automatic completion for `lua_extension` setting

### Fixed

- Argon version at the top of the quick pick menu is now displayed properly

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

[unreleased]: https://github.com/argon-rbx/argon-vscode/compare/2.0.13...HEAD
[2.0.13]: https://github.com/argon-rbx/argon-vscode/compare/2.0.12...2.0.13
[2.0.12]: https://github.com/argon-rbx/argon-vscode/compare/2.0.11...2.0.12
[2.0.11]: https://github.com/argon-rbx/argon-vscode/compare/2.0.10...2.0.11
[2.0.10]: https://github.com/argon-rbx/argon-vscode/compare/2.0.9...2.0.10
[2.0.9]: https://github.com/argon-rbx/argon-vscode/compare/2.0.8...2.0.9
[2.0.8]: https://github.com/argon-rbx/argon-vscode/compare/2.0.7...2.0.8
[2.0.7]: https://github.com/argon-rbx/argon-vscode/compare/2.0.6...2.0.7
[2.0.6]: https://github.com/argon-rbx/argon-vscode/compare/2.0.5...2.0.6
[2.0.5]: https://github.com/argon-rbx/argon-vscode/compare/2.0.4...2.0.5
[2.0.4]: https://github.com/argon-rbx/argon-vscode/compare/2.0.3...2.0.4
[2.0.3]: https://github.com/argon-rbx/argon-vscode/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/argon-rbx/argon-vscode/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/argon-rbx/argon-vscode/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/argon-rbx/argon-vscode/compare/87f2daec9b41b73676470d5eab01fe2fdc129cc8...2.0.0
