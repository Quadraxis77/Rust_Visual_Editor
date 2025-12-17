// Compiler Service - Web API for Rust compilation checking
// Can be run as a local HTTP service or integrated into a larger application

use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[cfg(feature = "web-service")]
use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::post,
    Router,
};

mod rust_compiler;
use rust_compiler::{CompilationResult, RustCompiler};

/// Request to check Rust code
#[derive(Debug, Deserialize)]
pub struct CheckRequest {
    pub code: String,
    #[serde(default)]
    pub dependencies: Vec<Dependency>,
    #[serde(default)]
    pub quick_check: bool,
}

#[derive(Debug, Deserialize)]
pub struct Dependency {
    pub name: String,
    pub version: String,
}

/// Response from compilation check
#[derive(Debug, Serialize)]
pub struct CheckResponse {
    pub result: CompilationResult,
    pub rust_available: bool,
}

/// Application state
pub struct AppState {
    compiler: Arc<RustCompiler>,
}

#[cfg(feature = "web-service")]
/// Create the web service router
pub fn create_router() -> Router {
    let compiler = Arc::new(RustCompiler::new().expect("Failed to create compiler"));
    let state = Arc::new(AppState { compiler });

    Router::new()
        .route("/check", post(check_code))
        .route("/health", axum::routing::get(health_check))
        .with_state(state)
}

#[cfg(feature = "web-service")]
/// Health check endpoint
async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "ok",
        "rust_available": rust_compiler::is_rust_available(),
        "cargo_available": rust_compiler::is_cargo_available(),
    }))
}

#[cfg(feature = "web-service")]
/// Check Rust code endpoint
async fn check_code(
    State(state): State<Arc<AppState>>,
    Json(request): Json<CheckRequest>,
) -> Result<Json<CheckResponse>, StatusCode> {
    let result = if request.quick_check {
        // Quick syntax check
        state
            .compiler
            .quick_check(&request.code)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else if request.dependencies.is_empty() {
        // Standard check without dependencies
        state
            .compiler
            .check_code(&request.code)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    } else {
        // Check with dependencies
        let deps: Vec<(&str, &str)> = request
            .dependencies
            .iter()
            .map(|d| (d.name.as_str(), d.version.as_str()))
            .collect();

        state
            .compiler
            .check_code_with_deps(&request.code, &deps)
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
    };

    Ok(Json(CheckResponse {
        result,
        rust_available: rust_compiler::is_rust_available(),
    }))
}

#[cfg(feature = "web-service")]
/// Start the web service
pub async fn start_service(port: u16) -> Result<(), Box<dyn std::error::Error>> {
    let app = create_router();
    let addr = std::net::SocketAddr::from(([127, 0, 0, 1], port));

    println!("🦀 Rust Compiler Service starting on http://{}", addr);
    println!("   POST /check - Check Rust code");
    println!("   GET  /health - Health check");

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await?;

    Ok(())
}

// CLI interface for standalone usage
#[cfg(feature = "cli")]
pub mod cli {
    use super::*;
    use clap::Parser;

    #[derive(Parser, Debug)]
    #[clap(name = "rust-compiler-service")]
    #[clap(about = "Rust compilation checking service for Blockly editor")]
    pub struct Args {
        /// Port to run the service on
        #[clap(short, long, default_value = "3030")]
        pub port: u16,

        /// Check a file directly (instead of starting service)
        #[clap(short, long)]
        pub file: Option<String>,
    }

    pub async fn run() -> Result<(), Box<dyn std::error::Error>> {
        let args = Args::parse();

        if let Some(file_path) = args.file {
            // Direct file check mode
            let code = std::fs::read_to_string(&file_path)?;
            let compiler = RustCompiler::new()?;
            let result = compiler.check_code(&code)?;

            println!("{}", serde_json::to_string_pretty(&result)?);

            if !result.success {
                std::process::exit(1);
            }
        } else {
            // Service mode
            #[cfg(feature = "web-service")]
            start_service(args.port).await?;

            #[cfg(not(feature = "web-service"))]
            {
                eprintln!("Web service feature not enabled. Rebuild with --features web-service");
                std::process::exit(1);
            }
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_check_request_deserialize() {
        let json = r#"{
            "code": "fn main() {}",
            "quick_check": true
        }"#;

        let request: CheckRequest = serde_json::from_str(json).unwrap();
        assert_eq!(request.code, "fn main() {}");
        assert!(request.quick_check);
    }
}
