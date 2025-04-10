# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), that adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.4] - 2024-04-09

### Changed
- Updated dependency management and internal configurations
- Improved compatibility with latest Roblox Studio plugin (0.0.4)
- Enhanced documentation and developer workflow

## [0.0.3] - 2024-04-09

### Changed
- Renamed Argon visual elements to Lemonade.
- Updated internal project configuration and dependencies.
- Fixed directory structure references.

## [0.0.2] - 2025-04-08

## [0.0.1] - 2024-04-08

### Added

- New `Output` command to quickly see Argon output channel

### Changed

- Reset version to 0.0.1 for initial Lemonade release
- Fixed linting issues in codebase
- Renamed LemonadeRAG to lemonadeRag for improved ESLint compliance

## [2.0.18] - 2025-02-05

### Added

- Option to disable auto-update of the Argon CLI

## [2.0.17] - 2025-01-26

### Added

- Completion for `rename_instances` setting
- `Show Output` button in error notifications

### Fixed

- Argon CLI installation issue that occurred only for some Windows users ([#52](https://github.com/LupaHQ/argon-vscode/issues/52))

## [2.0.16] - 2024-11-22

### Changed

- `name` field in project file is now optional
- `Stop` command will now run immediately if there is only one session to stop
- `Studio` command will now run without extra prompt if there are no places to choose from

### Added

- `AutoRun` option can now restore multiple sessions ([#28](https://github.com/LupaHQ/argon-vscode/pull/28))
- `CustomPath` setting which enables specifying custom Argon CLI installation path

## [2.0.15] - 2024-10-25

### Fixed

- Hot fixed last session port restoring in `Serve` command

## [2.0.14] - 2024-10-24

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

- `AutoRun` option can now restore multiple sessions ([#28](https://github.com/LupaHQ/argon-vscode/pull/28))
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

- Automatic completion for `package_manager`