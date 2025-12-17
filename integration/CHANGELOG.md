# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2024-12-17

### Fixed
- Reduced package size by excluding target directory and documentation files
- Updated repository URLs to correct GitHub location

## [0.1.0] - 2024-12-17

### Added
- Initial release of blockly-rust-compiler
- Core Rust compilation checking functionality
- `RustCompiler` for validating generated Rust code
- `CompilationResult` and `CompilationError` types
- Optional web service feature with Axum REST API
- Optional CLI binary for command-line usage
- Multi-file compilation support
- Cargo and rustc availability checking
- JSON serialization support via serde

### Features
- `web-service`: Axum-based HTTP service for remote compilation checking
- `cli`: Command-line interface for standalone usage
- `full`: All features enabled

[Unreleased]: https://github.com/Quadraxis77/Rust_Visual_Editor/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/Quadraxis77/Rust_Visual_Editor/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Quadraxis77/Rust_Visual_Editor/releases/tag/v0.1.0
