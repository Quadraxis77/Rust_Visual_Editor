// Blockly Rust Compiler Library
// Provides Rust compilation checking for the Blockly visual editor

pub mod blockly_bridge;
pub mod rust_compiler;

#[cfg(feature = "web-service")]
pub mod compiler_service;

// Re-export main types
pub use rust_compiler::{
    CompilationError, CompilationResult, ErrorLevel, RustCompiler,
    is_cargo_available, is_rust_available,
};

#[cfg(feature = "web-service")]
pub use compiler_service::{CheckRequest, CheckResponse, create_router, start_service};
