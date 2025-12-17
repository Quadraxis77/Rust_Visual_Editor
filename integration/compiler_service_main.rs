// Main entry point for the Rust Compiler Service

#[cfg(all(feature = "web-service", feature = "cli"))]
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    blockly_rust_compiler::compiler_service::cli::run().await
}

#[cfg(not(all(feature = "web-service", feature = "cli")))]
fn main() {
    eprintln!("This binary requires both 'web-service' and 'cli' features.");
    eprintln!("Build with: cargo build --features full");
    std::process::exit(1);
}
