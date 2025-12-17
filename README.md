# 🦀 Rust Visual Editor

**Version 0.2.2**

A visual programming environment for Rust, WGSL, and Bevy built with Blockly.

## Quick Start

**Simplest way**: Double-click `Start Rust Visual Editor.lnk` in the project root

Or manually:
- Navigate to the `web` folder
- Double-click `index.html` to open in your browser

> **Note**: For advanced features like the Rust compiler service, you'll need to run a local server (see Development section).

## Features

- **Multi-Mode Editor**: Switch between Rust, WGSL, and Bevy modes
- **Visual Block Programming**: Drag-and-drop interface for building code
- **🎮 Game Development Blocks**: 100+ Scratch-like blocks for Bevy game development (NEW in v0.2.0)
  - Movement, input, collision, health, inventory, AI, particles, camera, and more!
  - **Auto-generates required components** - no manual setup needed!
- **Real-time Code Generation**: See generated code as you build
- **Multi-File Support**: Generate and manage multiple files
- **Code Validation**: Built-in validation and error checking
- **Import/Export**: Save and load workspaces, export generated code
- **Rust Compiler Integration**: Check code with the Rust compiler (requires backend service)

## Project Structure

```
.
├── web/                    # Frontend application
│   ├── index.html         # Main entry point
│   ├── app.js             # Application logic
│   ├── blocks/            # Block definitions (Rust, WGSL, Bevy)
│   ├── generators/        # Code generators
│   ├── core/              # Core modules (validators, managers)
│   ├── toolbox/           # Toolbox configurations
│   └── utils/             # Utility functions
├── integration/           # Rust backend (compiler service)
│   ├── Cargo.toml
│   └── src/
└── examples/              # Example workspaces
```

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python 3.x (for local development server)
- Rust toolchain (optional, for compiler service)

## Development

### Frontend Only
The visual editor works standalone without the backend:
```bash
cd web
python -m http.server 8000
```

### With Rust Compiler Service
To enable code checking features:
```bash
cd integration
cargo run --bin compiler_service
```

The service runs on `http://localhost:3030`

## Usage

1. **Select Mode**: Choose between Rust, WGSL, or Bevy from the dropdown
2. **Add Blocks**: Drag blocks from the toolbox to the workspace
3. **Generate Code**: Code updates automatically as you build
4. **Check Code**: Click "Check Code" to validate (requires backend)
5. **Export**: Save your workspace or export generated code

### Linking Files Together

The visual editor supports multi-file projects with visual connection lines showing file relationships.

#### Step-by-Step Guide:

**1. Create Your Files**
- Open the **Files** category in the toolbox
- Drag a **📄 File** block to the workspace
- Set the filename (e.g., `main.rs`, `utils.rs`, `config.rs`)
- Add your code blocks inside each file container

**2. Link Files Together**
- In your main file, drag a **🔗 mod** block from the **Files** category
- Enter the module name (without `.rs` extension)
  - Example: To link to `utils.rs`, enter `utils`
- A visual connection line will automatically appear between the blocks!

**3. Import Items**
- Use the **use** block to import specific items from linked modules
- Example: `use utils::helper_function;`
- Or import everything: `use utils::*;`

**4. Make Items Public**
- In the linked file, use **pub** blocks to make items accessible
- Example: `pub fn helper_function() { ... }`

#### Complete Example:

**main.rs:**
```
📄 File: main.rs
  🔗 mod utils;
  🔗 mod config;
  
  use utils::calculate;
  use config::Settings;
  
  fn main() {
    let result = calculate(10);
    println!("Result: {}", result);
  }
```

**utils.rs:**
```
📄 File: utils.rs
  pub fn calculate(x: i32) -> i32 {
    x * 2
  }
```

**config.rs:**
```
📄 File: config.rs
  pub struct Settings {
    pub debug: bool
  }
```

#### Visual Feedback:
- **Teal dashed lines** connect `🔗 mod` blocks to their target files
- **Arrows** point from the mod declaration to the file
- Lines update automatically as you move blocks around

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- IE11: ❌ Not supported

## License

See LICENSE file for details.
