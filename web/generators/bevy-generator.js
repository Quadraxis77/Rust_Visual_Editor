/**
 * Bevy ECS Code Generator for Blockly System
 * 
 * This generator handles code generation for Bevy ECS blocks with enhanced features:
 * - Template-based code generation using TemplateEngine
 * - Automatic import statement generation (use bevy::prelude::*, etc.)
 * - Code syntax validation
 * - Fallback to custom generator functions
 * - Support for cross-mode type compatibility
 * - Shared Rust block generators for cross-compatibility
 * 
 * Requirements: 2.2, 2.5, 3.1, 3.2, 10.3
 */

// Initialize Bevy Generator
const BevyGenerator = new Blockly.Generator('Bevy');

// Import shared Rust generator functions if available
if (typeof RustGenerator !== 'undefined') {
    // Copy all Rust block generators to Bevy generator for cross-compatibility
    for (const blockType in RustGenerator.forBlock) {
        if (blockType.startsWith('rust_') && !BevyGenerator.forBlock[blockType]) {
            BevyGenerator.forBlock[blockType] = function(block) {
                // Use the Rust generator but with Bevy's context
                const originalGenerator = RustGenerator.forBlock[blockType];
                // Temporarily swap generator context
                const savedGenerator = RustGenerator;
                const code = originalGenerator.call({
                    valueToCode: BevyGenerator.valueToCode.bind(BevyGenerator),
                    statementToCode: BevyGenerator.statementToCode.bind(BevyGenerator),
                    ORDER_NONE: BevyGenerator.ORDER_NONE,
                    ORDER_ATOMIC: BevyGenerator.ORDER_ATOMIC,
                    ORDER_UNARY: BevyGenerator.ORDER_UNARY,
                    ORDER_ADDITIVE: BevyGenerator.ORDER_ADDITIVE,
                    ORDER_MULTIPLICATIVE: BevyGenerator.ORDER_MULTIPLICATIVE,
                    ORDER_RELATIONAL: BevyGenerator.ORDER_RELATIONAL,
                    ORDER_EQUALITY: BevyGenerator.ORDER_EQUALITY,
                    ORDER_LOGICAL_AND: BevyGenerator.ORDER_LOGICAL_AND,
                    ORDER_LOGICAL_OR: BevyGenerator.ORDER_LOGICAL_OR,
                    ORDER_RANGE: BevyGenerator.ORDER_RANGE,
                    ORDER_ASSIGNMENT: BevyGenerator.ORDER_ASSIGNMENT
                }, block);
                return code;
            };
        }
    }
}

// Set operator precedence (same as Rust since Bevy uses Rust)
BevyGenerator.PRECEDENCE = 0;
BevyGenerator.ORDER_ATOMIC = 0;
BevyGenerator.ORDER_UNARY = 1;
BevyGenerator.ORDER_MULTIPLICATIVE = 2;
BevyGenerator.ORDER_ADDITIVE = 3;
BevyGenerator.ORDER_RELATIONAL = 4;
BevyGenerator.ORDER_EQUALITY = 5;
BevyGenerator.ORDER_LOGICAL_AND = 6;
BevyGenerator.ORDER_LOGICAL_OR = 7;
BevyGenerator.ORDER_RANGE = 8;
BevyGenerator.ORDER_ASSIGNMENT = 9;
BevyGenerator.ORDER_NONE = 99;

// Initialize Template Engine (assumes template-engine.js is loaded)
const bevyTemplateEngine = typeof TemplateEngine !== 'undefined' ? new TemplateEngine() : null;

// Track required imports
let bevyRequiredImports = new Set();

/**
 * Add an import statement to the required imports set
 */
function addBevyImport(importStatement) {
    bevyRequiredImports.add(importStatement);
}

/**
 * Generate all import statements
 */
function generateBevyImports() {
    if (bevyRequiredImports.size === 0) {
        return '';
    }
    
    const imports = Array.from(bevyRequiredImports).sort().join('\n');
    return imports + '\n\n';
}

/**
 * Clear all tracked imports (called at start of generation)
 */
function clearBevyImports() {
    bevyRequiredImports = new Set();
}

/**
 * Process a block using template-based generation or custom generator
 */
function processBevyBlockWithTemplate(block, generatorFn) {
    // Check if template engine is available and block has a template
    if (bevyTemplateEngine && block.template && typeof block.template === 'string') {
        try {
            // Build context from block fields and inputs
            const context = {};
            
            // Get all field values
            const fields = block.inputList.flatMap(input => input.fieldRow);
            fields.forEach(field => {
                if (field.name) {
                    context[field.name] = field.getValue();
                }
            });
            
            // Get all input values
            block.inputList.forEach(input => {
                if (input.name && input.connection && input.type !== Blockly.inputTypes.STATEMENT) {
                    const value = BevyGenerator.valueToCode(block, input.name, BevyGenerator.ORDER_NONE);
                    context[input.name] = value || '';
                }
            });
            
            // Get all statement inputs
            block.inputList.forEach(input => {
                if (input.type === Blockly.inputTypes.STATEMENT && input.name) {
                    const statements = BevyGenerator.statementToCode(block, input.name);
                    context[input.name] = statements || '';
                }
            });
            
            // Process template
            const code = bevyTemplateEngine.process(block.template, context);
            
            // Validate template syntax
            if (!bevyTemplateEngine.validateTemplate(block.template)) {
                console.warn(`Invalid template for block ${block.type}`);
                // Fall back to custom generator
                return generatorFn ? generatorFn(block) : '';
            }
            
            return code;
        } catch (error) {
            console.error(`Template processing error for block ${block.type}:`, error);
            // Fall back to custom generator
            return generatorFn ? generatorFn(block) : '';
        }
    }
    
    // No template or template engine, use custom generator function
    return generatorFn ? generatorFn(block) : '';
}

/**
 * Override the scrub_ function to handle block chaining
 */
BevyGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        return code + BevyGenerator.blockToCode(nextBlock);
    }
    return code;
};

/**
 * Override workspaceToCode to add imports and clear state
 */
BevyGenerator.workspaceToCode = function(workspace) {
    // Clear imports at start of generation
    clearBevyImports();
    
    // Clear game components tracking (from game-generator.js)
    if (typeof clearGameComponents === 'function') {
        clearGameComponents();
    }
    
    // Add default Bevy imports
    addBevyImport('use bevy::prelude::*;');
    
    // Generate code for all blocks
    let code = [];
    const blocks = workspace.getTopBlocks(true);
    for (let i = 0; i < blocks.length; i++) {
        let blockCode = BevyGenerator.blockToCode(blocks[i]);
        if (Array.isArray(blockCode)) {
            blockCode = blockCode[0];
        }
        if (blockCode) {
            code.push(blockCode);
        }
    }
    
    // Generate game components if any were used
    let gameComponents = '';
    if (typeof generateGameComponents === 'function') {
        gameComponents = generateGameComponents();
    }
    
    // Combine imports, game components, and code
    const imports = generateBevyImports();
    const fullCode = imports + gameComponents + code.join('\n');
    
    // Validate generated code (basic syntax check)
    if (!validateBevyRustSyntax(fullCode)) {
        console.warn('Generated Bevy code may have syntax issues');
    }
    
    return fullCode;
};

/**
 * Basic Rust/Bevy syntax validation
 */
function validateBevyRustSyntax(code) {
    // Basic checks for common syntax errors
    const lines = code.split('\n');
    let braceCount = 0;
    let parenCount = 0;
    let bracketCount = 0;
    
    for (const line of lines) {
        for (const char of line) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
            if (char === '(') parenCount++;
            if (char === ')') parenCount--;
            if (char === '[') bracketCount++;
            if (char === ']') bracketCount--;
        }
    }
    
    // Check for balanced braces, parens, and brackets
    if (braceCount !== 0 || parenCount !== 0 || bracketCount !== 0) {
        console.error('Unbalanced braces, parentheses, or brackets in generated Bevy code');
        return false;
    }
    
    return true;
}

// ============================================================================
// PLUGIN BLOCKS
// ============================================================================

BevyGenerator.forBlock['bevy_plugin'] = function(block) {
    const name = block.getFieldValue('NAME');
    const build = BevyGenerator.statementToCode(block, 'BUILD');
    
    return `pub struct ${name};\n\nimpl Plugin for ${name} {\n    fn build(&self, app: &mut App) {\n${build}    }\n}\n\n`;
};

BevyGenerator.forBlock['bevy_plugin_impl'] = function(block) {
    const name = block.getFieldValue('NAME');
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return `impl Plugin for ${name} {\n    fn build(&self, app: &mut App) {\n${body}    }\n}\n\n`;
};

// ============================================================================
// APP CONFIGURATION BLOCKS
// ============================================================================

BevyGenerator.forBlock['bevy_add_systems'] = function(block) {
    const schedule = block.getFieldValue('SCHEDULE');
    const systems = BevyGenerator.valueToCode(block, 'SYSTEMS', BevyGenerator.ORDER_NONE) || 'system';
    
    const scheduleMap = {
        'STARTUP': 'Startup',
        'UPDATE': 'Update',
        'PRE_UPDATE': 'PreUpdate',
        'POST_UPDATE': 'PostUpdate',
        'FIXED_UPDATE': 'FixedUpdate',
        'FIRST': 'First',
        'LAST': 'Last'
    };
    
    return `app.add_systems(${scheduleMap[schedule]}, ${systems});\n`;
};

BevyGenerator.forBlock['bevy_add_plugins'] = function(block) {
    const plugin = BevyGenerator.valueToCode(block, 'PLUGIN', BevyGenerator.ORDER_NONE) || 'DefaultPlugins';
    
    return `app.add_plugins(${plugin});\n`;
};

BevyGenerator.forBlock['bevy_init_resource'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return `app.init_resource::<${type}>();\n`;
};

BevyGenerator.forBlock['bevy_insert_resource'] = function(block) {
    const resource = BevyGenerator.valueToCode(block, 'RESOURCE', BevyGenerator.ORDER_NONE) || 'resource';
    
    return `app.insert_resource(${resource});\n`;
};

BevyGenerator.forBlock['bevy_add_event'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return `app.add_event::<${type}>();\n`;
};

// ============================================================================
// SYSTEM DEFINITION BLOCKS
// ============================================================================

BevyGenerator.forBlock['bevy_system'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = BevyGenerator.valueToCode(block, 'PARAMS', BevyGenerator.ORDER_NONE) || '';
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return `fn ${name}(${params}) {\n${body}}\n\n`;
};

// ============================================================================
// SYSTEM PARAMETER BLOCKS
// ============================================================================

BevyGenerator.forBlock['bevy_query'] = function(block) {
    const components = BevyGenerator.valueToCode(block, 'COMPONENTS', BevyGenerator.ORDER_NONE) || '';
    const filter = BevyGenerator.valueToCode(block, 'FILTER', BevyGenerator.ORDER_NONE) || '';
    
    return [`Query<${components}${filter}>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_components'] = function(block) {
    const components = block.getFieldValue('COMPONENTS');
    
    return [components, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_filter'] = function(block) {
    const filter = block.getFieldValue('FILTER');
    
    return [`, ${filter}`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_res'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`Res<${type}>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_res_mut'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`ResMut<${type}>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_commands'] = function(block) {
    return ['Commands', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_time'] = function(block) {
    return ['Res<Time>', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_assets'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`ResMut<Assets<${type}>>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_event_reader'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`EventReader<${type}>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_event_writer'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`EventWriter<${type}>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_local'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`Local<${type}>`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_query_iter'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    
    return [`${query}.iter()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_iter_mut'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    
    return [`${query}.iter_mut()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_single'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    
    return [`${query}.single()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_single_mut'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    
    return [`${query}.single_mut()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_get'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    const entity = BevyGenerator.valueToCode(block, 'ENTITY', BevyGenerator.ORDER_NONE) || 'entity';
    
    return [`${query}.get(${entity})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_query_get_mut'] = function(block) {
    const query = BevyGenerator.valueToCode(block, 'QUERY', BevyGenerator.ORDER_ATOMIC) || 'query';
    const entity = BevyGenerator.valueToCode(block, 'ENTITY', BevyGenerator.ORDER_NONE) || 'entity';
    
    return [`${query}.get_mut(${entity})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// COMMANDS OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_spawn'] = function(block) {
    const commands = BevyGenerator.valueToCode(block, 'COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'commands';
    const bundle = BevyGenerator.valueToCode(block, 'BUNDLE', BevyGenerator.ORDER_NONE) || '()';
    
    return [`${commands}.spawn(${bundle})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_spawn_empty'] = function(block) {
    const commands = BevyGenerator.valueToCode(block, 'COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'commands';
    
    return [`${commands}.spawn_empty()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_despawn'] = function(block) {
    const commands = BevyGenerator.valueToCode(block, 'COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'commands';
    const entity = BevyGenerator.valueToCode(block, 'ENTITY', BevyGenerator.ORDER_NONE) || 'entity';
    
    return `${commands}.entity(${entity}).despawn();\n`;
};

BevyGenerator.forBlock['bevy_insert'] = function(block) {
    const commands = BevyGenerator.valueToCode(block, 'COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'commands';
    const entity = BevyGenerator.valueToCode(block, 'ENTITY', BevyGenerator.ORDER_NONE) || 'entity';
    const component = BevyGenerator.valueToCode(block, 'COMPONENT', BevyGenerator.ORDER_NONE) || 'component';
    
    return `${commands}.entity(${entity}).insert(${component});\n`;
};

BevyGenerator.forBlock['bevy_remove'] = function(block) {
    const commands = BevyGenerator.valueToCode(block, 'COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'commands';
    const entity = BevyGenerator.valueToCode(block, 'ENTITY', BevyGenerator.ORDER_NONE) || 'entity';
    const component = block.getFieldValue('COMPONENT');
    
    return `${commands}.entity(${entity}).remove::<${component}>();\n`;
};

// ============================================================================
// COMPONENT BUNDLES
// ============================================================================

BevyGenerator.forBlock['bevy_transform_bundle'] = function(block) {
    const transform = BevyGenerator.valueToCode(block, 'TRANSFORM', BevyGenerator.ORDER_NONE) || 'Transform::default()';
    
    return [`TransformBundle { transform: ${transform}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_pbr_bundle'] = function(block) {
    const mesh = BevyGenerator.valueToCode(block, 'MESH', BevyGenerator.ORDER_NONE) || 'mesh';
    const material = BevyGenerator.valueToCode(block, 'MATERIAL', BevyGenerator.ORDER_NONE) || 'material';
    const transform = BevyGenerator.valueToCode(block, 'TRANSFORM', BevyGenerator.ORDER_NONE) || 'Transform::default()';
    
    return [`PbrBundle { mesh: ${mesh}, material: ${material}, transform: ${transform}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_component_tuple'] = function(block) {
    const components = block.getFieldValue('COMPONENTS');
    
    return [`(${components})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// TRANSFORM OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_transform_xyz'] = function(block) {
    const x = BevyGenerator.valueToCode(block, 'X', BevyGenerator.ORDER_NONE) || '0.0';
    const y = BevyGenerator.valueToCode(block, 'Y', BevyGenerator.ORDER_NONE) || '0.0';
    const z = BevyGenerator.valueToCode(block, 'Z', BevyGenerator.ORDER_NONE) || '0.0';
    
    return [`Transform::from_xyz(${x}, ${y}, ${z})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_transform_translation'] = function(block) {
    const vec3 = BevyGenerator.valueToCode(block, 'VEC3', BevyGenerator.ORDER_NONE) || 'Vec3::ZERO';
    
    return [`Transform::from_translation(${vec3})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_transform_rotation'] = function(block) {
    const quat = BevyGenerator.valueToCode(block, 'QUAT', BevyGenerator.ORDER_NONE) || 'Quat::IDENTITY';
    
    return [`Transform::from_rotation(${quat})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_transform_scale'] = function(block) {
    const vec3 = BevyGenerator.valueToCode(block, 'VEC3', BevyGenerator.ORDER_NONE) || 'Vec3::ONE';
    
    return [`Transform::from_scale(${vec3})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// TIME OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_time_delta'] = function(block) {
    const time = BevyGenerator.valueToCode(block, 'TIME', BevyGenerator.ORDER_ATOMIC) || 'time';
    
    return [`${time}.delta_secs()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_time_elapsed'] = function(block) {
    const time = BevyGenerator.valueToCode(block, 'TIME', BevyGenerator.ORDER_ATOMIC) || 'time';
    
    return [`${time}.elapsed_secs()`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_read_events'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const reader = BevyGenerator.valueToCode(block, 'READER', BevyGenerator.ORDER_ATOMIC) || 'events';
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return `for ${varName} in ${reader}.read() {\n${body}}\n`;
};

BevyGenerator.forBlock['bevy_send_event'] = function(block) {
    const writer = BevyGenerator.valueToCode(block, 'WRITER', BevyGenerator.ORDER_ATOMIC) || 'events';
    const event = BevyGenerator.valueToCode(block, 'EVENT', BevyGenerator.ORDER_NONE) || 'event';
    
    return `${writer}.send(${event});\n`;
};

// ============================================================================
// RESOURCE OPERATIONS
// ============================================================================

BevyGenerator.forBlock['bevy_is_changed'] = function(block) {
    const resource = BevyGenerator.valueToCode(block, 'RESOURCE', BevyGenerator.ORDER_ATOMIC) || 'resource';
    
    return [`${resource}.is_changed()`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// COMPONENT MARKERS
// ============================================================================

BevyGenerator.forBlock['bevy_derive_component'] = function(block) {
    const struct = BevyGenerator.statementToCode(block, 'STRUCT');
    
    return `#[derive(Component)]\n${struct}`;
};

BevyGenerator.forBlock['bevy_derive_resource'] = function(block) {
    const struct = BevyGenerator.statementToCode(block, 'STRUCT');
    
    return `#[derive(Resource)]\n${struct}`;
};

BevyGenerator.forBlock['bevy_derive_event'] = function(block) {
    const struct = BevyGenerator.statementToCode(block, 'STRUCT');
    
    return `#[derive(Event)]\n${struct}`;
};

// ============================================================================
// SYSTEM CHAINING
// ============================================================================

BevyGenerator.forBlock['bevy_system_tuple'] = function(block) {
    const systems = block.getFieldValue('SYSTEMS');
    
    return [`(${systems})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_system_chain'] = function(block) {
    const systems = BevyGenerator.valueToCode(block, 'SYSTEMS', BevyGenerator.ORDER_ATOMIC) || 'systems';
    
    return [`${systems}.chain()`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_run_if'] = function(block) {
    const system = BevyGenerator.valueToCode(block, 'SYSTEM', BevyGenerator.ORDER_ATOMIC) || 'system';
    const condition = block.getFieldValue('CONDITION');
    
    return [`${system}.run_if(${condition})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ENTITY TYPE
// ============================================================================

BevyGenerator.forBlock['bevy_entity'] = function(block) {
    return ['Entity', BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// CROSS-MODE REFERENCE BLOCKS
// ============================================================================

BevyGenerator.forBlock['bevy_reference_node'] = function(block) {
    const targetFile = block.getFieldValue('TARGET_FILE');
    const targetSymbol = block.getFieldValue('TARGET_SYMBOL');
    const description = block.getFieldValue('DESCRIPTION');
    
    // Infer target mode from file extension
    let targetMode = 'rust';
    if (targetFile.endsWith('.wgsl')) {
        targetMode = 'wgsl';
    }
    
    // Generate appropriate import or comment based on target mode
    let code = '';
    
    if (targetMode === 'wgsl') {
        // WGSL shader reference - add as comment
        code = `// Shader reference: ${targetFile}`;
        if (description) {
            code += ` - ${description}`;
        }
        code += '\n';
    } else if (targetMode === 'rust') {
        // Rust reference - generate use statement
        if (targetSymbol) {
            // Convert filename to module path (e.g., "cells.rs" -> "crate::cells")
            const modulePath = targetFile.replace('.rs', '').replace(/\//g, '::');
            const importStatement = `use crate::${modulePath}::${targetSymbol};`;
            addBevyImport(importStatement);
            code = `// Reference: ${targetSymbol} from ${targetFile}\n`;
        } else {
            // No specific symbol, just add comment
            code = `// Reference to ${targetFile}`;
            if (description) {
                code += ` - ${description}`;
            }
            code += '\n';
        }
    }
    
    return code;
};

// ============================================================================
// VEC3 / VEC2 / QUAT CONSTRUCTORS
// ============================================================================

BevyGenerator.forBlock['bevy_vec3_new'] = function(block) {
    const x = BevyGenerator.valueToCode(block, 'X', BevyGenerator.ORDER_NONE) || '0.0';
    const y = BevyGenerator.valueToCode(block, 'Y', BevyGenerator.ORDER_NONE) || '0.0';
    const z = BevyGenerator.valueToCode(block, 'Z', BevyGenerator.ORDER_NONE) || '0.0';
    
    return [`Vec3::new(${x}, ${y}, ${z})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_vec3_const'] = function(block) {
    const constant = block.getFieldValue('CONST');
    
    return [`Vec3::${constant}`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_vec2_new'] = function(block) {
    const x = BevyGenerator.valueToCode(block, 'X', BevyGenerator.ORDER_NONE) || '0.0';
    const y = BevyGenerator.valueToCode(block, 'Y', BevyGenerator.ORDER_NONE) || '0.0';
    
    return [`Vec2::new(${x}, ${y})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_quat_from_rotation'] = function(block) {
    const axis = block.getFieldValue('AXIS');
    const angle = BevyGenerator.valueToCode(block, 'ANGLE', BevyGenerator.ORDER_NONE) || '0.0';
    
    return [`Quat::from_rotation_${axis}(${angle})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// CAMERA BUNDLES
// ============================================================================

BevyGenerator.forBlock['bevy_camera3d_bundle'] = function(block) {
    const transform = BevyGenerator.valueToCode(block, 'TRANSFORM', BevyGenerator.ORDER_NONE) || 'Transform::default()';
    
    return [`Camera3dBundle { transform: ${transform}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_camera2d_bundle'] = function(block) {
    return ['Camera2dBundle::default()', BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// LIGHT BUNDLES
// ============================================================================

BevyGenerator.forBlock['bevy_point_light_bundle'] = function(block) {
    const transform = BevyGenerator.valueToCode(block, 'TRANSFORM', BevyGenerator.ORDER_NONE) || 'Transform::default()';
    
    return [`PointLightBundle { transform: ${transform}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_directional_light_bundle'] = function(block) {
    const transform = BevyGenerator.valueToCode(block, 'TRANSFORM', BevyGenerator.ORDER_NONE) || 'Transform::default()';
    
    return [`DirectionalLightBundle { transform: ${transform}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// MESH PRIMITIVES
// ============================================================================

BevyGenerator.forBlock['bevy_mesh_primitive'] = function(block) {
    const primitive = block.getFieldValue('PRIMITIVE');
    
    const primitiveMap = {
        'CUBOID': 'Cuboid::default()',
        'SPHERE': 'Sphere::default()',
        'PLANE': 'Plane3d::default()',
        'CAPSULE': 'Capsule3d::default()',
        'CYLINDER': 'Cylinder::default()',
        'TORUS': 'Torus::default()'
    };
    
    return [`meshes.add(${primitiveMap[primitive]})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_mesh_primitive_sized'] = function(block) {
    const primitive = block.getFieldValue('PRIMITIVE');
    const size = BevyGenerator.valueToCode(block, 'SIZE', BevyGenerator.ORDER_NONE) || '1.0';
    
    const primitiveMap = {
        'CUBOID': 'Cuboid::new',
        'SPHERE': 'Sphere::new',
        'CAPSULE': 'Capsule3d::new',
        'CYLINDER': 'Cylinder::new'
    };
    
    return [`meshes.add(${primitiveMap[primitive]}(${size}))`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// MATERIAL & COLOR
// ============================================================================

BevyGenerator.forBlock['bevy_standard_material'] = function(block) {
    const r = BevyGenerator.valueToCode(block, 'R', BevyGenerator.ORDER_NONE) || '1.0';
    const g = BevyGenerator.valueToCode(block, 'G', BevyGenerator.ORDER_NONE) || '1.0';
    const b = BevyGenerator.valueToCode(block, 'B', BevyGenerator.ORDER_NONE) || '1.0';
    
    return [`materials.add(Color::srgb(${r}, ${g}, ${b}))`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_standard_material_full'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    const metallic = BevyGenerator.valueToCode(block, 'METALLIC', BevyGenerator.ORDER_NONE) || '0.0';
    const roughness = BevyGenerator.valueToCode(block, 'ROUGHNESS', BevyGenerator.ORDER_NONE) || '0.5';
    
    return [`materials.add(StandardMaterial { base_color: ${color}, metallic: ${metallic}, perceptual_roughness: ${roughness}, ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_emissive'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    
    return [`materials.add(StandardMaterial { emissive: ${color}.into(), ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_textured'] = function(block) {
    const texture = BevyGenerator.valueToCode(block, 'TEXTURE', BevyGenerator.ORDER_NONE) || 'texture_handle';
    
    return [`materials.add(StandardMaterial { base_color_texture: Some(${texture}), ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_normal_map'] = function(block) {
    const texture = BevyGenerator.valueToCode(block, 'TEXTURE', BevyGenerator.ORDER_NONE) || 'texture_handle';
    
    return [`materials.add(StandardMaterial { normal_map_texture: Some(${texture}), ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_alpha_mode'] = function(block) {
    const mode = block.getFieldValue('MODE');
    
    const modeMap = {
        'Opaque': 'AlphaMode::Opaque',
        'Blend': 'AlphaMode::Blend',
        'Mask': 'AlphaMode::Mask(0.5)',
        'Add': 'AlphaMode::Add',
        'Multiply': 'AlphaMode::Multiply'
    };
    
    return [`materials.add(StandardMaterial { alpha_mode: ${modeMap[mode]}, ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_unlit'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    
    return [`materials.add(StandardMaterial { base_color: ${color}, unlit: true, ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_material_double_sided'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    
    return [`materials.add(StandardMaterial { base_color: ${color}, double_sided: true, ..Default::default() })`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_color_const'] = function(block) {
    const color = block.getFieldValue('COLOR');
    
    return [`Color::${color}`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_color_srgb'] = function(block) {
    const r = BevyGenerator.valueToCode(block, 'R', BevyGenerator.ORDER_NONE) || '1.0';
    const g = BevyGenerator.valueToCode(block, 'G', BevyGenerator.ORDER_NONE) || '1.0';
    const b = BevyGenerator.valueToCode(block, 'B', BevyGenerator.ORDER_NONE) || '1.0';
    
    return [`Color::srgb(${r}, ${g}, ${b})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_color_srgba'] = function(block) {
    const r = BevyGenerator.valueToCode(block, 'R', BevyGenerator.ORDER_NONE) || '1.0';
    const g = BevyGenerator.valueToCode(block, 'G', BevyGenerator.ORDER_NONE) || '1.0';
    const b = BevyGenerator.valueToCode(block, 'B', BevyGenerator.ORDER_NONE) || '1.0';
    const a = BevyGenerator.valueToCode(block, 'A', BevyGenerator.ORDER_NONE) || '1.0';
    
    return [`Color::srgba(${r}, ${g}, ${b}, ${a})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ASSET LOADING
// ============================================================================

BevyGenerator.forBlock['bevy_asset_server'] = function(block) {
    return ['Res<AssetServer>', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_load_asset'] = function(block) {
    const assetServer = BevyGenerator.valueToCode(block, 'ASSET_SERVER', BevyGenerator.ORDER_ATOMIC) || 'asset_server';
    const path = block.getFieldValue('PATH');
    
    return [`${assetServer}.load("${path}")`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// INPUT HANDLING
// ============================================================================

BevyGenerator.forBlock['bevy_keyboard_input'] = function(block) {
    return ['Res<ButtonInput<KeyCode>>', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_key_pressed'] = function(block) {
    const input = BevyGenerator.valueToCode(block, 'INPUT', BevyGenerator.ORDER_ATOMIC) || 'keyboard';
    const key = block.getFieldValue('KEY');
    
    return [`${input}.pressed(KeyCode::${key})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_key_just_pressed'] = function(block) {
    const input = BevyGenerator.valueToCode(block, 'INPUT', BevyGenerator.ORDER_ATOMIC) || 'keyboard';
    const key = block.getFieldValue('KEY');
    
    return [`${input}.just_pressed(KeyCode::${key})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

BevyGenerator.forBlock['bevy_state'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`Res<State<${type}>>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_next_state'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return [`ResMut<NextState<${type}>>`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_set_state'] = function(block) {
    const nextState = BevyGenerator.valueToCode(block, 'NEXT_STATE', BevyGenerator.ORDER_ATOMIC) || 'next_state';
    const type = block.getFieldValue('TYPE');
    const variant = block.getFieldValue('VARIANT');
    
    return `${nextState}.set(${type}::${variant});\n`;
};

BevyGenerator.forBlock['bevy_in_state'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const variant = block.getFieldValue('VARIANT');
    
    return [`in_state(${type}::${variant})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_on_enter'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const variant = block.getFieldValue('VARIANT');
    
    return [`OnEnter(${type}::${variant})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_on_exit'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const variant = block.getFieldValue('VARIANT');
    
    return [`OnExit(${type}::${variant})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// APP RUNNER
// ============================================================================

BevyGenerator.forBlock['bevy_app_new'] = function(block) {
    return ['App::new()', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_app_run'] = function(block) {
    const app = BevyGenerator.valueToCode(block, 'APP', BevyGenerator.ORDER_ATOMIC) || 'app';
    
    return `${app}.run();\n`;
};

// ============================================================================
// COMMON PLUGINS
// ============================================================================

BevyGenerator.forBlock['bevy_default_plugins'] = function(block) {
    return ['DefaultPlugins', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_minimal_plugins'] = function(block) {
    return ['MinimalPlugins', BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// HIERARCHY
// ============================================================================

BevyGenerator.forBlock['bevy_with_children'] = function(block) {
    const entityCommands = BevyGenerator.valueToCode(block, 'ENTITY_COMMANDS', BevyGenerator.ORDER_ATOMIC) || 'entity';
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return [`${entityCommands}.with_children(|parent| {\n${body}})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_parent_spawn'] = function(block) {
    const bundle = BevyGenerator.valueToCode(block, 'BUNDLE', BevyGenerator.ORDER_NONE) || '()';
    
    return `parent.spawn(${bundle});\n`;
};

// ============================================================================
// RENDERING MODULES - FOG
// ============================================================================

BevyGenerator.forBlock['bevy_fog_settings'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    const falloffType = block.getFieldValue('FALLOFF');
    const falloffParams = BevyGenerator.valueToCode(block, 'FALLOFF_PARAMS', BevyGenerator.ORDER_NONE);
    
    if (falloffParams) {
        return [`FogSettings { color: ${color}, falloff: ${falloffParams}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
    }
    
    return [`FogSettings { color: ${color}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_fog_falloff_linear'] = function(block) {
    const start = BevyGenerator.valueToCode(block, 'START', BevyGenerator.ORDER_NONE) || '0.0';
    const end = BevyGenerator.valueToCode(block, 'END', BevyGenerator.ORDER_NONE) || '100.0';
    
    return [`FogFalloff::Linear { start: ${start}, end: ${end} }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_fog_falloff_exponential'] = function(block) {
    const density = BevyGenerator.valueToCode(block, 'DENSITY', BevyGenerator.ORDER_NONE) || '0.1';
    
    return [`FogFalloff::Exponential { density: ${density} }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - AMBIENT LIGHT
// ============================================================================

BevyGenerator.forBlock['bevy_ambient_light'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    const brightness = BevyGenerator.valueToCode(block, 'BRIGHTNESS', BevyGenerator.ORDER_NONE) || '0.3';
    
    return [`AmbientLight { color: ${color}, brightness: ${brightness} }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - SHADOWS
// ============================================================================

BevyGenerator.forBlock['bevy_cascaded_shadow_config'] = function(block) {
    const numCascades = block.getFieldValue('NUM_CASCADES');
    
    return [`CascadeShadowConfig { num_cascades: ${numCascades}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_shadow_settings'] = function(block) {
    const enabled = block.getFieldValue('ENABLED') === 'TRUE';
    
    return [`shadows_enabled: ${enabled}`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - SKYBOX
// ============================================================================

BevyGenerator.forBlock['bevy_skybox'] = function(block) {
    const image = BevyGenerator.valueToCode(block, 'IMAGE', BevyGenerator.ORDER_NONE) || 'image_handle';
    const brightness = BevyGenerator.valueToCode(block, 'BRIGHTNESS', BevyGenerator.ORDER_NONE) || '1000.0';
    
    return [`Skybox { image: ${image}, brightness: ${brightness} }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - BLOOM
// ============================================================================

BevyGenerator.forBlock['bevy_bloom_settings'] = function(block) {
    const intensity = BevyGenerator.valueToCode(block, 'INTENSITY', BevyGenerator.ORDER_NONE) || '0.3';
    
    return [`BloomSettings { intensity: ${intensity}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - TONEMAPPING
// ============================================================================

BevyGenerator.forBlock['bevy_tonemapping'] = function(block) {
    const method = block.getFieldValue('METHOD');
    
    return [`Tonemapping::${method}`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - MSAA
// ============================================================================

BevyGenerator.forBlock['bevy_msaa'] = function(block) {
    const samples = block.getFieldValue('SAMPLES');
    
    return [`Msaa::${samples}`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - CLEAR COLOR
// ============================================================================

BevyGenerator.forBlock['bevy_clear_color'] = function(block) {
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::BLACK';
    
    return [`ClearColor(${color})`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - VISIBILITY
// ============================================================================

BevyGenerator.forBlock['bevy_visibility'] = function(block) {
    const state = block.getFieldValue('STATE');
    
    return [`Visibility::${state}`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// RENDERING MODULES - WIREFRAME
// ============================================================================

BevyGenerator.forBlock['bevy_wireframe'] = function(block) {
    return ['Wireframe', BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_no_wireframe'] = function(block) {
    return ['NoWireframe', BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// PHYSICS MODULES - VELOCITY
// ============================================================================

BevyGenerator.forBlock['bevy_velocity'] = function(block) {
    const linear = BevyGenerator.valueToCode(block, 'LINEAR', BevyGenerator.ORDER_NONE) || 'Vec3::ZERO';
    const angular = BevyGenerator.valueToCode(block, 'ANGULAR', BevyGenerator.ORDER_NONE) || 'Vec3::ZERO';
    
    return [`Velocity { linvel: ${linear}, angvel: ${angular} }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// UI MODULES - TEXT
// ============================================================================

BevyGenerator.forBlock['bevy_text_bundle'] = function(block) {
    const text = BevyGenerator.valueToCode(block, 'TEXT', BevyGenerator.ORDER_NONE) || 'Text::default()';
    const style = BevyGenerator.valueToCode(block, 'STYLE', BevyGenerator.ORDER_NONE);
    
    if (style) {
        return [`TextBundle { text: ${text}, style: ${style}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
    }
    
    return [`TextBundle { text: ${text}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_text'] = function(block) {
    const content = block.getFieldValue('CONTENT');
    const style = BevyGenerator.valueToCode(block, 'STYLE', BevyGenerator.ORDER_NONE) || 'TextStyle::default()';
    
    return [`Text::from_section("${content}", ${style})`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_text_style'] = function(block) {
    const size = BevyGenerator.valueToCode(block, 'SIZE', BevyGenerator.ORDER_NONE) || '30.0';
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    
    return [`TextStyle { font_size: ${size}, color: ${color}, ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// UI MODULES - NODE
// ============================================================================

BevyGenerator.forBlock['bevy_node_bundle'] = function(block) {
    const style = BevyGenerator.valueToCode(block, 'STYLE', BevyGenerator.ORDER_NONE) || 'Style::default()';
    const color = BevyGenerator.valueToCode(block, 'COLOR', BevyGenerator.ORDER_NONE) || 'Color::WHITE';
    
    return [`NodeBundle { style: ${style}, background_color: ${color}.into(), ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

BevyGenerator.forBlock['bevy_ui_style'] = function(block) {
    const width = BevyGenerator.valueToCode(block, 'WIDTH', BevyGenerator.ORDER_NONE) || '100.0';
    const height = BevyGenerator.valueToCode(block, 'HEIGHT', BevyGenerator.ORDER_NONE) || '100.0';
    
    return [`Style { width: Val::Px(${width}), height: Val::Px(${height}), ..Default::default() }`, BevyGenerator.ORDER_ATOMIC];
};

// ============================================================================
// FILE & MODULE ORGANIZATION
// ============================================================================

BevyGenerator.forBlock['bevy_mod'] = function(block) {
    const name = block.getFieldValue('NAME');
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return `mod ${name} {\n${body}}\n\n`;
};

BevyGenerator.forBlock['bevy_mod_file'] = function(block) {
    const name = block.getFieldValue('NAME');
    return `mod ${name};\n`;
};

BevyGenerator.forBlock['bevy_use'] = function(block) {
    const path = block.getFieldValue('PATH');
    
    return `use ${path};\n`;
};

BevyGenerator.forBlock['bevy_pub_use'] = function(block) {
    const path = block.getFieldValue('PATH');
    
    return `pub use ${path};\n`;
};

BevyGenerator.forBlock['bevy_pub_mod'] = function(block) {
    const name = block.getFieldValue('NAME');
    const body = BevyGenerator.statementToCode(block, 'BODY');
    
    return `pub mod ${name} {\n${body}}\n\n`;
};

BevyGenerator.forBlock['bevy_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    
    return `// ${text}\n`;
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BevyGenerator;
}
