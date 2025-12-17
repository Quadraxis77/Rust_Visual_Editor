# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2024-12-17

### Added
- **Game Development Blocks**: 100+ Scratch-like blocks for game development with Bevy
  - Movement blocks (basic and advanced: dash, jump, double jump, wall jump)
  - Input handling (keyboard, mouse)
  - Collision detection
  - Health and damage system
  - Game state management (score, lives, timer, levels, pause)
  - Animation system
  - Camera controls (follow, shake, zoom, bounds)
  - Particle effects and screen effects
  - Sound system
  - Physics (forces, impulses, gravity, friction, bounce)
  - AI behaviors (follow, flee, patrol, wander)
  - Spawning and wave management
  - Inventory system
  - UI and HUD elements
  - Random and math utilities
  - Advanced movement (dash, jump mechanics)
- Game block generators that output Bevy ECS code
- Organized game blocks into 16 subcategories in toolbox
- Comprehensive documentation for game blocks
- Support for `game_` prefix blocks in multi-file generator

### Changed
- All game blocks and subcategories now use consistent blue color (210)
- Updated toolbox organization with nested game block categories

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

[Unreleased]: https://github.com/Quadraxis77/Rust_Visual_Editor/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Quadraxis77/Rust_Visual_Editor/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/Quadraxis77/Rust_Visual_Editor/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Quadraxis77/Rust_Visual_Editor/releases/tag/v0.1.0
