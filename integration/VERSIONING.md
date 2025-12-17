# Semantic Versioning Guide

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

## Version Format: MAJOR.MINOR.PATCH

### MAJOR version (X.0.0)
Increment when you make **incompatible API changes**:
- Removing public functions, types, or modules
- Changing function signatures (parameters, return types)
- Renaming public APIs
- Changing behavior that breaks existing code

**Examples:**
- `0.1.0` → `1.0.0`: Removed `CompilationError::message` field
- `1.2.3` → `2.0.0`: Changed `RustCompiler::check()` to return `Result<T, E>`

### MINOR version (0.X.0)
Increment when you add **backwards-compatible functionality**:
- Adding new public functions, types, or modules
- Adding new optional parameters (with defaults)
- Adding new features
- Deprecating functionality (without removing)

**Examples:**
- `0.1.0` → `0.2.0`: Added `RustCompiler::check_with_options()`
- `1.0.0` → `1.1.0`: Added new `wasm-support` feature

### PATCH version (0.0.X)
Increment when you make **backwards-compatible bug fixes**:
- Fixing bugs without changing API
- Performance improvements
- Documentation updates
- Internal refactoring

**Examples:**
- `0.1.0` → `0.1.1`: Fixed error message formatting
- `1.2.0` → `1.2.1`: Improved compilation error parsing

## Pre-1.0 Versions (0.x.x)

During initial development (0.x.x):
- Breaking changes can happen in MINOR versions
- The API is not yet stable
- Use `0.x.0` for breaking changes
- Use `0.x.y` for features and fixes

## Version Update Workflow

1. **Decide the version bump:**
   - Breaking change? → MAJOR
   - New feature? → MINOR
   - Bug fix? → PATCH

2. **Update files:**
   ```bash
   # Update version in Cargo.toml
   # Update CHANGELOG.md with changes
   ```

3. **Commit and tag:**
   ```bash
   git add Cargo.toml CHANGELOG.md
   git commit -m "Release v0.2.0"
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin main --tags
   ```

4. **Publish:**
   ```bash
   cargo publish
   ```

## Current Version: 0.1.0

This is the initial release. The API is not yet stable.

## Planned Milestones

- **0.1.x**: Initial releases, bug fixes
- **0.2.0**: Add WGSL compilation support
- **0.3.0**: Add Bevy-specific validation
- **1.0.0**: Stable API, production-ready

## Breaking Change Policy

Before 1.0.0:
- Breaking changes allowed in minor versions
- Will be documented in CHANGELOG.md

After 1.0.0:
- Breaking changes only in major versions
- Deprecation warnings for at least one minor version before removal
