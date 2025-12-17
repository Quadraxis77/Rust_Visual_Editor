# Publishing the Blockly Rust Compiler Crate

## Pre-Publishing Checklist

### 1. Update Cargo.toml Metadata
- [ ] Update `repository` URL with your actual GitHub repository
- [ ] Update `homepage` URL if different from repository
- [ ] Verify `authors` field
- [ ] Ensure `version` follows [semver](https://semver.org/)
- [ ] Check that `description` is clear and concise (max 200 chars)

### 2. Add a License File
Create a LICENSE file in the `integration/` directory:
```bash
# For MIT license
curl https://opensource.org/licenses/MIT -o LICENSE-MIT

# For Apache 2.0 license
curl https://www.apache.org/licenses/LICENSE-2.0.txt -o LICENSE-APACHE
```

### 3. Test Your Crate
```bash
cd integration

# Run tests
cargo test

# Check for issues
cargo clippy

# Build with all features
cargo build --all-features

# Build documentation
cargo doc --no-deps --open
```

### 4. Verify Package Contents
```bash
# See what will be included in the package
cargo package --list

# Create a package without uploading
cargo package --allow-dirty
```

## Publishing Steps

### 1. Login to crates.io
```bash
cargo login
```
You'll need an API token from https://crates.io/me

### 2. Publish
```bash
cd integration
cargo publish
```

### 3. Verify Publication
Visit https://crates.io/crates/blockly-rust-compiler

## Using Your Published Crate

Users can add it to their `Cargo.toml`:

```toml
[dependencies]
blockly-rust-compiler = "0.1.0"

# With web service feature
blockly-rust-compiler = { version = "0.1.0", features = ["web-service"] }

# With all features
blockly-rust-compiler = { version = "0.1.0", features = ["full"] }
```

## Version Updates

When releasing new versions:

1. Update version in `Cargo.toml`
2. Update `CHANGELOG.md` (create one if needed)
3. Commit changes
4. Tag the release: `git tag -a v0.1.1 -m "Release v0.1.1"`
5. Push tags: `git push --tags`
6. Publish: `cargo publish`

## Common Issues

### "no license file found"
Add LICENSE-MIT and/or LICENSE-APACHE files to the integration directory.

### "repository field should be a URL"
Update the repository field in Cargo.toml with your actual GitHub URL.

### "failed to verify package tarball"
Run `cargo package` first to see what's being included and fix any issues.

## Features

Your crate supports these features:
- `default`: Core library only
- `web-service`: Includes Axum web service
- `cli`: Includes CLI binary
- `full`: All features enabled
