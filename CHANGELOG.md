# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `InfiniteScroll` — wrap `Scrollbar`, load more when the viewport reaches the end
- `Scrollbar` `onReachEnd` / `reachEndPx`

## [0.2.2] - 2026-08-14

### Added

- Per-package `README.md` for `@vscode-shell/ui` (`0.2.1`), `@vscode-shell/antd` (`0.2.2`), and `@vscode-shell/flowbite` (`0.2.2`) so npm package pages show getting-started docs

### Changed

- Package `homepage` fields point at each package directory on GitHub
- `@vscode-shell/ui` published as `0.2.1` (docs-only; no API change)

## [0.2.1] - 2026-08-14

### Fixed

- Re-publish `@vscode-shell/antd` and `@vscode-shell/flowbite` as `0.2.1` after `0.2.0` metadata failed to become fetchable on the public registry

## [0.2.0] - 2026-08-12

### Added

- `@vscode-shell/antd` — optional Ant Design theme bridge (`createAntTheme`, `--ant-*` CSS vars)
- `@vscode-shell/flowbite` — optional Flowbite theme bridge (`createFlowbiteTheme`)

### Changed

- `@vscode-shell/ui` version aligned to `0.2.0` for synchronized releases (no chrome API break)

[Unreleased]: https://github.com/deskkit/vscode-shell/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/deskkit/vscode-shell/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/deskkit/vscode-shell/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/deskkit/vscode-shell/releases/tag/v0.2.0
