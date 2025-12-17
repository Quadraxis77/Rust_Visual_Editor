// Rust Compiler Integration for Blockly Editor
// Provides compilation checking and error reporting for generated Rust code

use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Command;

/// Compilation result with errors and warnings
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilationResult {
    pub success: bool,
    pub errors: Vec<CompilationError>,
    pub warnings: Vec<CompilationError>,
    pub stdout: String,
    pub stderr: String,
}

/// Individual compilation error or warning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilationError {
    pub level: ErrorLevel,
    pub message: String,
    pub code: Option<String>,
    pub line: Option<usize>,
    pub column: Option<usize>,
    pub file: Option<String>,
    pub suggestion: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ErrorLevel {
    Error,
    Warning,
    Note,
    Help,
}

/// Rust compiler checker
pub struct RustCompiler {
    temp_dir: PathBuf,
}

impl RustCompiler {
    /// Create a new Rust compiler checker
    pub fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let temp_dir = std::env::temp_dir().join("blockly_rust_check");
        fs::create_dir_all(&temp_dir)?;
        
        Ok(Self { temp_dir })
    }

    /// Check Rust code for compilation errors
    /// 
    /// This creates a temporary Rust project and runs `cargo check` to validate the code
    pub fn check_code(&self, code: &str) -> Result<CompilationResult, Box<dyn std::error::Error>> {
        // Create a temporary Cargo project
        let project_dir = self.temp_dir.join(format!("check_{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&project_dir)?;

        // Create Cargo.toml
        let cargo_toml = r#"[package]
name = "blockly_check"
version = "0.1.0"
edition = "2021"

[dependencies]
"#;
        fs::write(project_dir.join("Cargo.toml"), cargo_toml)?;

        // Create src directory and main.rs
        let src_dir = project_dir.join("src");
        fs::create_dir_all(&src_dir)?;
        
        // Wrap code in a main function if it doesn't have one
        let wrapped_code = if !code.contains("fn main") {
            format!("fn main() {{\n{}\n}}", code)
        } else {
            code.to_string()
        };
        
        fs::write(src_dir.join("main.rs"), wrapped_code)?;

        // Run cargo check with JSON output
        let output = Command::new("cargo")
            .arg("check")
            .arg("--message-format=json")
            .current_dir(&project_dir)
            .output()?;

        // Parse the output
        let result = self.parse_cargo_output(&output.stdout, &output.stderr)?;

        // Clean up temporary directory
        let _ = fs::remove_dir_all(&project_dir);

        Ok(result)
    }

    /// Check Rust code with custom dependencies
    pub fn check_code_with_deps(
        &self,
        code: &str,
        dependencies: &[(&str, &str)],
    ) -> Result<CompilationResult, Box<dyn std::error::Error>> {
        // Create a temporary Cargo project
        let project_dir = self.temp_dir.join(format!("check_{}", uuid::Uuid::new_v4()));
        fs::create_dir_all(&project_dir)?;

        // Create Cargo.toml with dependencies
        let mut cargo_toml = String::from(
            r#"[package]
name = "blockly_check"
version = "0.1.0"
edition = "2021"

[dependencies]
"#,
        );

        for (name, version) in dependencies {
            cargo_toml.push_str(&format!("{} = \"{}\"\n", name, version));
        }

        fs::write(project_dir.join("Cargo.toml"), cargo_toml)?;

        // Create src directory and main.rs
        let src_dir = project_dir.join("src");
        fs::create_dir_all(&src_dir)?;
        fs::write(src_dir.join("main.rs"), code)?;

        // Run cargo check with JSON output
        let output = Command::new("cargo")
            .arg("check")
            .arg("--message-format=json")
            .current_dir(&project_dir)
            .output()?;

        // Parse the output
        let result = self.parse_cargo_output(&output.stdout, &output.stderr)?;

        // Clean up temporary directory
        let _ = fs::remove_dir_all(&project_dir);

        Ok(result)
    }

    /// Quick syntax check without full compilation
    /// Uses rustc directly for faster feedback
    pub fn quick_check(&self, code: &str) -> Result<CompilationResult, Box<dyn std::error::Error>> {
        // Create temporary file
        let temp_file = self.temp_dir.join(format!("check_{}.rs", uuid::Uuid::new_v4()));
        fs::write(&temp_file, code)?;

        // Run rustc with JSON output
        let output = Command::new("rustc")
            .arg("--crate-type=lib")
            .arg("--error-format=json")
            .arg(&temp_file)
            .arg("-o")
            .arg("/dev/null") // Don't create output file
            .output()?;

        // Parse the output
        let result = self.parse_rustc_output(&output.stdout, &output.stderr)?;

        // Clean up
        let _ = fs::remove_file(&temp_file);

        Ok(result)
    }

    /// Parse cargo check JSON output
    fn parse_cargo_output(
        &self,
        stdout: &[u8],
        stderr: &[u8],
    ) -> Result<CompilationResult, Box<dyn std::error::Error>> {
        let stdout_str = String::from_utf8_lossy(stdout);
        let stderr_str = String::from_utf8_lossy(stderr);

        let mut errors = Vec::new();
        let mut warnings = Vec::new();

        // Parse JSON messages from cargo
        for line in stdout_str.lines() {
            if let Ok(msg) = serde_json::from_str::<serde_json::Value>(line) {
                if let Some(message) = msg.get("message") {
                    if let Some(rendered) = message.get("rendered").and_then(|v| v.as_str()) {
                        let level = message
                            .get("level")
                            .and_then(|v| v.as_str())
                            .unwrap_or("error");

                        let error = CompilationError {
                            level: match level {
                                "error" => ErrorLevel::Error,
                                "warning" => ErrorLevel::Warning,
                                "note" => ErrorLevel::Note,
                                "help" => ErrorLevel::Help,
                                _ => ErrorLevel::Error,
                            },
                            message: rendered.to_string(),
                            code: message
                                .get("code")
                                .and_then(|c| c.get("code"))
                                .and_then(|v| v.as_str())
                                .map(String::from),
                            line: message
                                .get("spans")
                                .and_then(|s| s.as_array())
                                .and_then(|arr| arr.first())
                                .and_then(|span| span.get("line_start"))
                                .and_then(|v| v.as_u64())
                                .map(|n| n as usize),
                            column: message
                                .get("spans")
                                .and_then(|s| s.as_array())
                                .and_then(|arr| arr.first())
                                .and_then(|span| span.get("column_start"))
                                .and_then(|v| v.as_u64())
                                .map(|n| n as usize),
                            file: message
                                .get("spans")
                                .and_then(|s| s.as_array())
                                .and_then(|arr| arr.first())
                                .and_then(|span| span.get("file_name"))
                                .and_then(|v| v.as_str())
                                .map(String::from),
                            suggestion: None,
                        };

                        match error.level {
                            ErrorLevel::Error => errors.push(error),
                            ErrorLevel::Warning => warnings.push(error),
                            _ => {}
                        }
                    }
                }
            }
        }

        Ok(CompilationResult {
            success: errors.is_empty(),
            errors,
            warnings,
            stdout: stdout_str.to_string(),
            stderr: stderr_str.to_string(),
        })
    }

    /// Parse rustc JSON output
    fn parse_rustc_output(
        &self,
        stdout: &[u8],
        stderr: &[u8],
    ) -> Result<CompilationResult, Box<dyn std::error::Error>> {
        // Similar to parse_cargo_output but for rustc
        self.parse_cargo_output(stdout, stderr)
    }
}

impl Default for RustCompiler {
    fn default() -> Self {
        Self::new().expect("Failed to create RustCompiler")
    }
}

/// Check if Rust toolchain is available
pub fn is_rust_available() -> bool {
    Command::new("rustc")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

/// Check if Cargo is available
pub fn is_cargo_available() -> bool {
    Command::new("cargo")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rust_available() {
        // This test will pass if Rust is installed
        let available = is_rust_available();
        println!("Rust available: {}", available);
    }

    #[test]
    fn test_valid_code() {
        if !is_cargo_available() {
            println!("Skipping test: cargo not available");
            return;
        }

        let compiler = RustCompiler::new().unwrap();
        let code = r#"
            fn add(a: i32, b: i32) -> i32 {
                a + b
            }
        "#;

        let result = compiler.check_code(code).unwrap();
        assert!(result.success, "Valid code should compile");
    }

    #[test]
    fn test_invalid_code() {
        if !is_cargo_available() {
            println!("Skipping test: cargo not available");
            return;
        }

        let compiler = RustCompiler::new().unwrap();
        let code = r#"
            fn add(a: i32, b: i32) -> i32 {
                a + // Missing operand
            }
        "#;

        let result = compiler.check_code(code).unwrap();
        assert!(!result.success, "Invalid code should not compile");
        assert!(!result.errors.is_empty(), "Should have errors");
    }
}
