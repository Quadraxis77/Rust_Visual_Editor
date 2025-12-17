// Example: Using the Rust compiler library directly

use blockly_rust_compiler::{RustCompiler, is_rust_available};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Check if Rust is available
    if !is_rust_available() {
        eprintln!("Rust toolchain not found. Please install Rust:");
        eprintln!("  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh");
        std::process::exit(1);
    }

    println!("🦀 Rust Compiler Example\n");

    // Create compiler instance
    let compiler = RustCompiler::new()?;

    // Example 1: Valid code
    println!("Example 1: Valid Rust code");
    println!("─────────────────────────");
    let valid_code = r#"
        fn add(a: i32, b: i32) -> i32 {
            a + b
        }

        fn main() {
            let result = add(5, 3);
            println!("5 + 3 = {}", result);
        }
    "#;

    let result = compiler.check_code(valid_code)?;
    println!("Success: {}", result.success);
    println!("Errors: {}", result.errors.len());
    println!("Warnings: {}\n", result.warnings.len());

    // Example 2: Code with syntax error
    println!("Example 2: Code with syntax error");
    println!("──────────────────────────────────");
    let invalid_code = r#"
        fn main() {
            let x = 5
            println!("x = {}", x);
        }
    "#;

    let result = compiler.check_code(invalid_code)?;
    println!("Success: {}", result.success);
    println!("Errors: {}", result.errors.len());
    
    if !result.errors.is_empty() {
        println!("\nError details:");
        for (i, error) in result.errors.iter().enumerate() {
            println!("  {}. {}", i + 1, error.message.lines().next().unwrap_or(""));
            if let Some(line) = error.line {
                println!("     Line: {}", line);
            }
        }
    }
    println!();

    // Example 3: Code with warning
    println!("Example 3: Code with warning");
    println!("────────────────────────────");
    let warning_code = r#"
        fn main() {
            let unused_variable = 42;
            println!("Hello, world!");
        }
    "#;

    let result = compiler.check_code(warning_code)?;
    println!("Success: {}", result.success);
    println!("Warnings: {}", result.warnings.len());
    
    if !result.warnings.is_empty() {
        println!("\nWarning details:");
        for (i, warning) in result.warnings.iter().enumerate() {
            println!("  {}. {}", i + 1, warning.message.lines().next().unwrap_or(""));
        }
    }
    println!();

    // Example 4: Quick syntax check
    println!("Example 4: Quick syntax check");
    println!("─────────────────────────────");
    let quick_code = r#"
        fn factorial(n: u64) -> u64 {
            match n {
                0 => 1,
                _ => n * factorial(n - 1)
            }
        }
    "#;

    let start = std::time::Instant::now();
    let result = compiler.quick_check(quick_code)?;
    let duration = start.elapsed();
    
    println!("Success: {}", result.success);
    println!("Check time: {:?}", duration);
    println!();

    println!("✓ All examples completed!");

    Ok(())
}
