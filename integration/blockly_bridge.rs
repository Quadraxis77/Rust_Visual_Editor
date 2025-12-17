// Blockly Bridge - Integration between Blockly editor and Rust applications

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

/// Load a genome from Blockly-generated JSON
pub fn load_blockly_genome(path: &Path) -> Result<BlocklyGenome, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(path)?;
    let genome: BlocklyGenome = serde_json::from_str(&content)?;
    Ok(genome)
}

/// Save a genome to Blockly-compatible JSON
pub fn save_blockly_genome(genome: &BlocklyGenome, path: &Path) -> Result<(), Box<dyn std::error::Error>> {
    let json = serde_json::to_string_pretty(genome)?;
    fs::write(path, json)?;
    Ok(())
}

/// Blockly-compatible genome structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlocklyGenome {
    pub name: String,
    pub initial_mode: usize,
    pub initial_orientation: Quaternion,
    pub modes: Vec<BlocklyMode>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlocklyMode {
    pub name: String,
    pub default_name: String,
    pub color: Color3,
    pub cell_type: u32,
    pub parent_make_adhesion: bool,
    pub split_mass: f32,
    pub split_interval: f32,
    pub parent_split_direction: Vec2,
    pub max_adhesions: u32,
    pub min_adhesions: u32,
    pub enable_parent_angle_snapping: bool,
    pub max_splits: i32,
    pub mode_a_after_splits: i32,
    pub mode_b_after_splits: i32,
    pub child_a: ChildSettings,
    pub child_b: ChildSettings,
    pub adhesion_settings: AdhesionSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChildSettings {
    pub mode_number: usize,
    pub orientation: Quaternion,
    pub keep_adhesion: bool,
    pub enable_angle_snapping: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdhesionSettings {
    pub can_break: bool,
    pub break_force: f32,
    pub rest_length: f32,
    pub linear_spring_stiffness: f32,
    pub linear_spring_damping: f32,
    pub orientation_spring_stiffness: f32,
    pub orientation_spring_damping: f32,
    pub max_angular_deviation: f32,
    pub twist_constraint_stiffness: f32,
    pub twist_constraint_damping: f32,
    pub enable_twist_constraint: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Quaternion {
    pub x: f32,
    pub y: f32,
    pub z: f32,
    pub w: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Color3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Vec2 {
    pub x: f32,
    pub y: f32,
}

/// Convert Blockly genome to application-specific internal format
/// Note: Implement this when integrating with your genome system
// impl BlocklyGenome {
//     pub fn to_internal_genome(&self) -> YourGenomeType {
//         // Convert Blockly format to internal genome format
//         // This would integrate with your existing genome system
//         todo!("Implement conversion to internal genome format")
//     }
// }

/// WGSL shader validation and loading
pub fn validate_wgsl_shader(source: &str) -> Result<(), String> {
    // Basic validation - check for required elements
    if !source.contains("@compute") {
        return Err("Missing @compute attribute".to_string());
    }
    if !source.contains("@workgroup_size") {
        return Err("Missing @workgroup_size attribute".to_string());
    }
    Ok(())
}

pub fn load_blockly_wgsl(path: &Path) -> Result<String, Box<dyn std::error::Error>> {
    let source = fs::read_to_string(path)?;
    validate_wgsl_shader(&source)?;
    Ok(source)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_genome_serialization() {
        let genome = BlocklyGenome {
            name: "Test Genome".to_string(),
            initial_mode: 0,
            initial_orientation: Quaternion { x: 0.0, y: 0.0, z: 0.0, w: 1.0 },
            modes: vec![],
        };

        let json = serde_json::to_string(&genome).unwrap();
        let deserialized: BlocklyGenome = serde_json::from_str(&json).unwrap();
        
        assert_eq!(genome.name, deserialized.name);
        assert_eq!(genome.initial_mode, deserialized.initial_mode);
    }

    #[test]
    fn test_wgsl_validation() {
        let valid_shader = "@compute @workgroup_size(64) fn main() {}";
        assert!(validate_wgsl_shader(valid_shader).is_ok());

        let invalid_shader = "fn main() {}";
        assert!(validate_wgsl_shader(invalid_shader).is_err());
    }
}
