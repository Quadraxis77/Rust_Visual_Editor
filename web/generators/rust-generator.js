/**
 * Consolidated Rust Code Generator for Blockly System
 * 
 * This generator consolidates all Rust block generators with enhanced features:
 * - Template-based code generation using TemplateEngine
 * - Automatic import statement generation
 * - Code syntax validation
 * - Fallback to custom generator functions
 * - Support for cross-mode type compatibility
 * 
 * Requirements: 3.1, 3.2, 3.3, 8.1, 8.2, 8.3, 10.3
 */

// Initialize Rust Generator
const RustGenerator = new Blockly.Generator('Rust');

// Set operator precedence
RustGenerator.PRECEDENCE = 0;
RustGenerator.ORDER_ATOMIC = 0;
RustGenerator.ORDER_UNARY = 1;
RustGenerator.ORDER_MULTIPLICATIVE = 2;
RustGenerator.ORDER_ADDITIVE = 3;
RustGenerator.ORDER_RELATIONAL = 4;
RustGenerator.ORDER_EQUALITY = 5;
RustGenerator.ORDER_LOGICAL_AND = 6;
RustGenerator.ORDER_LOGICAL_OR = 7;
RustGenerator.ORDER_RANGE = 8;
RustGenerator.ORDER_ASSIGNMENT = 9;
RustGenerator.ORDER_NONE = 99;

/**
 * Initialize the generator
 */
RustGenerator.init = function(workspace) {
    // Clear imports at start
    clearImports();
    
    // Detect if workspace has Bevy-specific blocks
    if (workspace) {
        const blocks = workspace.getAllBlocks(false);
        for (const block of blocks) {
            // Check for Bevy-specific block types
            if (block.type && (
                block.type.startsWith('bevy_') ||
                block.type.includes('query') ||
                block.type.includes('system') ||
                block.type.includes('component')
            )) {
                isBevyMode = true;
                break;
            }
        }
    }
};

// Initialize Template Engine
const templateEngine = new TemplateEngine();

// Track required imports
let requiredImports = new Set();

/**
 * Add an import statement to the required imports set
 */
function addImport(importStatement) {
    requiredImports.add(importStatement);
}

/**
 * Generate all import statements and standalone type definitions
 */
function generateImports() {
    if (requiredImports.size === 0) {
        return '';
    }
    
    let output = '';
    const imports = Array.from(requiredImports);
    
    // Check if we need standalone math types
    const needsStandaloneMath = imports.some(imp => imp.includes('Standalone math types'));
    
    if (needsStandaloneMath && !isBevyMode) {
        // Provide standalone Vec3 definition for Rust Playground
        output += `// Standalone Vec3 implementation for testing
// In production, use the glam or bevy crate
#[derive(Debug, Clone, Copy)]
pub struct Vec3 {
    pub x: f32,
    pub y: f32,
    pub z: f32,
}

impl Vec3 {
    pub fn new(x: f32, y: f32, z: f32) -> Self {
        Self { x, y, z }
    }
}

impl std::ops::Sub for Vec3 {
    type Output = Self;
    fn sub(self, other: Self) -> Self {
        Self::new(self.x - other.x, self.y - other.y, self.z - other.z)
    }
}

`;
        // Remove the standalone comment from imports
        const filteredImports = imports.filter(imp => !imp.includes('Standalone math types'));
        if (filteredImports.length > 0) {
            output += filteredImports.sort().join('\n') + '\n\n';
        }
    } else {
        // Just output regular imports
        output = imports.sort().join('\n') + '\n\n';
    }
    
    return output;
}

/**
 * Clear all tracked imports (called at start of generation)
 */
function clearImports() {
    requiredImports = new Set();
    isBevyMode = false; // Reset Bevy mode detection
}

/**
 * Track if we're in Bevy mode (has Bevy-specific blocks)
 */
let isBevyMode = false;

/**
 * Set whether we're in Bevy mode
 */
function setBevyMode(enabled) {
    isBevyMode = enabled;
}

/**
 * Auto-detect types and add necessary imports
 * Scans text for common Rust/Bevy types and automatically adds required imports
 */
function autoDetectImports(text) {
    if (!text || typeof text !== 'string') return;
    
    // Math types that can work standalone or with Bevy
    const mathTypes = ['Vec2', 'Vec3', 'Vec4', 'IVec2', 'IVec3', 'IVec4', 'UVec2', 'UVec3', 'UVec4', 'Quat', 'Mat2', 'Mat3', 'Mat4'];
    
    // Bevy-specific types (these REQUIRE Bevy)
    const bevyOnlyTypes = [
        'Transform', 'GlobalTransform',
        'Query', 'Commands', 'Res', 'ResMut', 'Local', 'EventReader', 'EventWriter',
        'Entity', 'Component', 'Resource', 'Bundle',
        'App', 'Plugin', 'Update', 'Startup', 'PreUpdate', 'PostUpdate',
        'Time', 'Timer', 'Stopwatch',
        'Color', 'Camera', 'Camera2d', 'Camera3d',
        'Mesh', 'Material', 'StandardMaterial',
        'Assets', 'Handle', 'AssetServer',
        'Input', 'KeyCode', 'MouseButton',
        'Window', 'WindowDescriptor',
        'Sprite', 'SpriteBundle', 'Text', 'TextBundle',
        'Node', 'Style', 'Val', 'UiRect',
        'With', 'Without', 'Added', 'Changed', 'Or',
        'Children', 'Parent', 'Name',
        'Visibility', 'ComputedVisibility'
    ];
    
    // Check for Bevy-only types (these force Bevy mode)
    for (const type of bevyOnlyTypes) {
        const regex = new RegExp(`\\b${type}\\b`);
        if (regex.test(text)) {
            isBevyMode = true;
            addImport('use bevy::prelude::*;');
            break;
        }
    }
    
    // Check for math types - only add Bevy import if in Bevy mode
    if (!isBevyMode) {
        for (const type of mathTypes) {
            const regex = new RegExp(`\\b${type}\\b`);
            if (regex.test(text)) {
                // Add standalone math type definitions instead of Bevy import
                addImport('// Standalone math types (compatible with glam crate)');
                break;
            }
        }
    }
    
    // Bevy ECS specific (if not already covered by prelude)
    if (/\b(World|Schedule|Stage|SystemSet|IntoSystemDescriptor)\b/.test(text)) {
        addImport('use bevy::ecs::prelude::*;');
    }
    
    // Bevy math (if using advanced math not in prelude)
    if (/\b(Affine2|Affine3|BVec2|BVec3|BVec4|DVec2|DVec3|DVec4)\b/.test(text)) {
        addImport('use bevy::math::*;');
    }
    
    // Bevy render
    if (/\b(RenderContext|RenderDevice|RenderQueue|RenderGraph)\b/.test(text)) {
        addImport('use bevy::render::prelude::*;');
    }
    
    // Bevy window
    if (/\b(WindowMode|WindowResolution|PresentMode|CursorIcon)\b/.test(text)) {
        addImport('use bevy::window::*;');
    }
    
    // Bevy audio
    if (/\b(Audio|AudioSource|PlaybackSettings)\b/.test(text)) {
        addImport('use bevy::audio::*;');
    }
    
    // Bevy sprite
    if (/\b(TextureAtlas|TextureAtlasSprite|Anchor)\b/.test(text)) {
        addImport('use bevy::sprite::*;');
    }
    
    // Standard library types
    if (/\b(HashMap|HashSet)\b/.test(text)) {
        addImport('use std::collections::{HashMap, HashSet};');
    }
    
    if (/\b(BTreeMap|BTreeSet)\b/.test(text)) {
        addImport('use std::collections::{BTreeMap, BTreeSet};');
    }
    
    if (/\b(Duration|Instant|SystemTime)\b/.test(text)) {
        addImport('use std::time::{Duration, Instant};');
    }
    
    if (/\b(Path|PathBuf)\b/.test(text)) {
        addImport('use std::path::{Path, PathBuf};');
    }
    
    if (/\b(File|OpenOptions)\b/.test(text)) {
        addImport('use std::fs::{File, OpenOptions};');
    }
    
    if (/\bResult\b/.test(text) && /\bError\b/.test(text)) {
        addImport('use std::error::Error;');
    }
}

/**
 * Process a block using template-based generation or custom generator
 */
function processBlockWithTemplate(block, generatorFn) {
    // Check if block has a template defined
    if (block.template && typeof block.template === 'string') {
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
                if (input.name && input.connection) {
                    const value = RustGenerator.valueToCode(block, input.name, RustGenerator.ORDER_NONE);
                    context[input.name] = value || '';
                }
            });
            
            // Get all statement inputs
            block.inputList.forEach(input => {
                if (input.type === Blockly.inputTypes.STATEMENT && input.name) {
                    const statements = RustGenerator.statementToCode(block, input.name);
                    context[input.name] = statements || '';
                }
            });
            
            // Process template
            const code = templateEngine.process(block.template, context);
            
            // Validate template syntax
            if (!templateEngine.validateTemplate(block.template)) {
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
    
    // No template, use custom generator function
    return generatorFn ? generatorFn(block) : '';
}

/**
 * Override the scrub_ function to handle block chaining
 */
RustGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        return code + RustGenerator.blockToCode(nextBlock);
    }
    return code;
};

/**
 * Override workspaceToCode to add imports and clear state
 */
RustGenerator.workspaceToCode = function(workspace) {
    console.log('[RustGenerator] workspaceToCode called');
    
    // Clear imports at start of generation
    clearImports();
    
    // Generate code for all blocks
    let code = [];
    const blocks = workspace.getTopBlocks(true);
    console.log('[RustGenerator] Found', blocks.length, 'top-level blocks');
    
    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        console.log('[RustGenerator] Processing block:', block.type);
        
        let blockCode = RustGenerator.blockToCode(block);
        console.log('[RustGenerator] Block code:', blockCode);
        
        if (Array.isArray(blockCode)) {
            blockCode = blockCode[0];
        }
        if (blockCode) {
            code.push(blockCode);
        } else {
            console.warn('[RustGenerator] No code generated for block:', block.type);
        }
    }
    
    console.log('[RustGenerator] Generated', code.length, 'code blocks');
    
    // Combine imports and code
    const imports = generateImports();
    const fullCode = imports + code.join('\n\n');
    
    console.log('[RustGenerator] Final code length:', fullCode.length);
    
    // Validate generated code (basic syntax check)
    if (!validateRustSyntax(fullCode)) {
        console.warn('[RustGenerator] Generated code may have syntax issues');
    }
    
    return fullCode;
};

/**
 * Finish code generation - called after workspaceToCode
 * Adds imports at the beginning of the code
 */
RustGenerator.finish = function(code) {
    // Generate imports
    const imports = generateImports();
    
    // Combine imports and code
    const fullCode = imports + code.trim();
    
    return fullCode + '\n';
};

/**
 * Basic Rust syntax validation
 */
function validateRustSyntax(code) {
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
        console.error('Unbalanced braces, parentheses, or brackets in generated code');
        return false;
    }
    
    return true;
}

// ============================================================================
// FUNCTION DEFINITION GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_main'] = function(block) {
    const body = RustGenerator.statementToCode(block, 'BODY');
    return `fn main() {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_function'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = RustGenerator.valueToCode(block, 'PARAMS_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const returnType = RustGenerator.valueToCode(block, 'RETURN_TYPE_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    let body = RustGenerator.statementToCode(block, 'BODY');
    
    // If body is empty, add unimplemented!() for functions with return types, or empty for unit return
    if (!body.trim()) {
        body = returnType ? '    unimplemented!()\n' : '';
    }
    
    return `fn ${name}(${params})${returnType} {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_pub_function'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = RustGenerator.valueToCode(block, 'PARAMS_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const returnType = RustGenerator.valueToCode(block, 'RETURN_TYPE_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    let body = RustGenerator.statementToCode(block, 'BODY');
    
    // If body is empty, add unimplemented!() for functions with return types, or empty for unit return
    if (!body.trim()) {
        body = returnType ? '    unimplemented!()\n' : '';
    }
    
    return `pub fn ${name}(${params})${returnType} {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_method'] = function(block) {
    const name = block.getFieldValue('NAME');
    const selfType = block.getFieldValue('SELF_TYPE');
    const params = RustGenerator.valueToCode(block, 'PARAMS_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const returnType = RustGenerator.valueToCode(block, 'RETURN_TYPE_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    const selfParam = selfType === 'REF' ? '&self' : selfType === 'MUT_REF' ? '&mut self' : 'self';
    const allParams = params ? `${selfParam}, ${params}` : selfParam;
    
    return `    fn ${name}(${allParams})${returnType} {\n${body}    }\n\n`;
};

RustGenerator.forBlock['rust_parameters'] = function(block) {
    const params = block.getFieldValue('PARAMS');
    
    // Auto-detect types and add necessary imports
    autoDetectImports(params);
    
    return [params, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_return_type'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    // Auto-detect types and add necessary imports
    autoDetectImports(type);
    
    return [` -> ${type}`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// IMPL BLOCK GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_impl'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const methods = RustGenerator.statementToCode(block, 'METHODS');
    
    return `impl ${type} {\n${methods}}\n\n`;
};

RustGenerator.forBlock['rust_impl_trait'] = function(block) {
    const trait = block.getFieldValue('TRAIT');
    const type = block.getFieldValue('TYPE');
    const methods = RustGenerator.statementToCode(block, 'METHODS');
    
    return `impl ${trait} for ${type} {\n${methods}}\n\n`;
};

// ============================================================================
// CONTROL FLOW GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_if'] = function(block) {
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'false';
    const then = RustGenerator.statementToCode(block, 'THEN');
    
    return `if ${condition} {\n${then}}\n`;
};

RustGenerator.forBlock['rust_if_else'] = function(block) {
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'false';
    const then = RustGenerator.statementToCode(block, 'THEN');
    const elseBlock = RustGenerator.statementToCode(block, 'ELSE');
    
    return `if ${condition} {\n${then}} else {\n${elseBlock}}\n`;
};

RustGenerator.forBlock['rust_match'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || 'value';
    const arms = RustGenerator.statementToCode(block, 'ARMS');
    
    return `match ${expr} {\n${arms}}\n`;
};

RustGenerator.forBlock['rust_match_arm'] = function(block) {
    const pattern = block.getFieldValue('PATTERN');
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || '()';
    
    return `    ${pattern} => ${expr},\n`;
};

RustGenerator.forBlock['rust_while'] = function(block) {
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'false';
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `while ${condition} {\n${body}}\n`;
};

RustGenerator.forBlock['rust_loop'] = function(block) {
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `loop {\n${body}}\n`;
};

RustGenerator.forBlock['rust_for_range'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const start = RustGenerator.valueToCode(block, 'START', RustGenerator.ORDER_NONE) || '0';
    const end = RustGenerator.valueToCode(block, 'END', RustGenerator.ORDER_NONE) || '10';
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `for ${varName} in ${start}..${end} {\n${body}}\n`;
};

RustGenerator.forBlock['rust_for_iter'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const iter = RustGenerator.valueToCode(block, 'ITER', RustGenerator.ORDER_NONE) || 'iterator';
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `for ${varName} in ${iter} {\n${body}}\n`;
};

// ============================================================================
// EXPRESSION GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_binary_op'] = function(block) {
    const left = RustGenerator.valueToCode(block, 'LEFT', RustGenerator.ORDER_ADDITIVE) || '0';
    const right = RustGenerator.valueToCode(block, 'RIGHT', RustGenerator.ORDER_ADDITIVE) || '0';
    const op = block.getFieldValue('OP');
    
    const opMap = {
        'ADD': '+', 'SUB': '-', 'MUL': '*', 'DIV': '/', 'MOD': '%',
        'EQ': '==', 'NE': '!=', 'LT': '<', 'GT': '>', 'LE': '<=', 'GE': '>=',
        'AND': '&&', 'OR': '||'
    };
    
    return [`${left} ${opMap[op]} ${right}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_unary_op'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_UNARY) || 'value';
    const op = block.getFieldValue('OP');
    
    const opMap = {
        'NEG': '-', 'NOT': '!', 'DEREF': '*', 'REF': '&', 'MUT_REF': '&mut '
    };
    
    return [`${opMap[op]}${expr}`, RustGenerator.ORDER_UNARY];
};

RustGenerator.forBlock['rust_call'] = function(block) {
    const func = block.getFieldValue('FUNCTION');
    
    // Handle multiple arguments from mutator
    const args = [];
    const argCount = block.argCount_ || 0;
    
    for (let i = 0; i < argCount; i++) {
        const arg = RustGenerator.valueToCode(block, 'ARG' + i, RustGenerator.ORDER_NONE);
        if (arg) {
            args.push(arg);
        }
    }
    
    const argsStr = args.join(', ');
    return [`${func}(${argsStr})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_method_call'] = function(block) {
    const object = RustGenerator.valueToCode(block, 'OBJECT', RustGenerator.ORDER_ATOMIC) || 'object';
    const method = block.getFieldValue('METHOD');
    const args = RustGenerator.valueToCode(block, 'ARGS', RustGenerator.ORDER_NONE) || '';
    
    return [`${object}.${method}(${args})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_method_call_expr'] = function(block) {
    const object = RustGenerator.valueToCode(block, 'OBJECT', RustGenerator.ORDER_ATOMIC) || 'object';
    const method = block.getFieldValue('METHOD');
    const args = RustGenerator.valueToCode(block, 'ARGS', RustGenerator.ORDER_NONE) || '';
    
    return [`${object}.${method}(${args})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_field_access'] = function(block) {
    const object = RustGenerator.valueToCode(block, 'OBJECT', RustGenerator.ORDER_ATOMIC) || 'object';
    const field = block.getFieldValue('FIELD');
    
    return [`${object}.${field}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_index'] = function(block) {
    const array = RustGenerator.valueToCode(block, 'ARRAY', RustGenerator.ORDER_ATOMIC) || 'array';
    const index = RustGenerator.valueToCode(block, 'INDEX', RustGenerator.ORDER_NONE) || '0';
    
    return [`${array}[${index}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_tuple_access'] = function(block) {
    const tuple = RustGenerator.valueToCode(block, 'TUPLE', RustGenerator.ORDER_ATOMIC) || 'tuple';
    const index = block.getFieldValue('INDEX');
    
    return [`${tuple}.${index}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_cast'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_UNARY) || 'value';
    const type = block.getFieldValue('TYPE');
    
    // Auto-detect types and add necessary imports
    autoDetectImports(type);
    
    return [`${expr} as ${type}`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// LITERAL GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_number'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [`${value}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_float'] = function(block) {
    let value = block.getFieldValue('VALUE');
    
    // Convert to string if it's a number
    value = String(value);
    
    // Ensure float literals have decimal point
    if (value && !value.includes('.') && !value.includes('e') && !value.includes('E')) {
        value = value + '.0';
    }
    
    return [`${value}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [`"${value}"`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_bool'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [value === 'TRUE' ? 'true' : 'false', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_var'] = function(block) {
    const name = block.getFieldValue('NAME');
    return [`${name}`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// STATEMENT GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_let'] = function(block) {
    const mutable = block.getFieldValue('MUTABLE') === 'TRUE';
    const name = block.getFieldValue('NAME');
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    
    const mutKeyword = mutable ? 'mut ' : '';
    return `let ${mutKeyword}${name} = ${value};\n`;
};

RustGenerator.forBlock['rust_let_binding'] = function(block) {
    const mutable = block.getFieldValue('MUTABLE') === 'TRUE';
    const name = block.getFieldValue('NAME');
    const typeAnnotation = RustGenerator.valueToCode(block, 'TYPE', RustGenerator.ORDER_NONE) || '';
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    
    const mutKeyword = mutable ? 'mut ' : '';
    return `let ${mutKeyword}${name}${typeAnnotation} = ${value};\n`;
};

RustGenerator.forBlock['rust_type_annotation'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    // Auto-detect types and add necessary imports
    autoDetectImports(type);
    
    return [`: ${type}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_assign'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '0';
    
    return `${varName} = ${value};\n`;
};

RustGenerator.forBlock['rust_assignment'] = function(block) {
    const target = RustGenerator.valueToCode(block, 'TARGET', RustGenerator.ORDER_NONE) || 'variable';
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    
    return `${target} = ${value};\n`;
};

RustGenerator.forBlock['rust_compound_assign'] = function(block) {
    const target = RustGenerator.valueToCode(block, 'TARGET', RustGenerator.ORDER_NONE) || 'variable';
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '0';
    const op = block.getFieldValue('OP');
    
    const opMap = {
        'ADD': '+=', 'SUB': '-=', 'MUL': '*=', 'DIV': '/=', 'MOD': '%='
    };
    
    return `${target} ${opMap[op]} ${value};\n`;
};

RustGenerator.forBlock['rust_return'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    return `return ${value};\n`;
};

RustGenerator.forBlock['rust_break'] = function(block) {
    return `break;\n`;
};

RustGenerator.forBlock['rust_continue'] = function(block) {
    return `continue;\n`;
};

RustGenerator.forBlock['rust_expr_stmt'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || '()';
    return `${expr};\n`;
};

// ============================================================================
// STRUCT & ENUM GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_struct'] = function(block) {
    const visibility = block.getFieldValue('VISIBILITY');
    const name = block.getFieldValue('NAME');
    const derives = block.getFieldValue('DERIVES');
    const fields = RustGenerator.statementToCode(block, 'FIELDS');
    
    const fieldLines = fields.trim().split('\n').filter(f => f.trim());
    const fieldStr = fieldLines.map(f => '    ' + f.trim()).join(',\n');
    
    const visPrefix = visibility === 'PUB' ? 'pub ' : '';
    const deriveAttr = derives ? `#[derive(${derives})]\n` : '';
    
    // Auto-detect types in derives and fields
    autoDetectImports(derives);
    autoDetectImports(fields);
    
    return `${deriveAttr}${visPrefix}struct ${name} {\n${fieldStr}\n}\n\n`;
};

RustGenerator.forBlock['rust_field'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    // Auto-detect types and add necessary imports
    autoDetectImports(type);
    
    return `pub ${name}: ${type}`;
};

RustGenerator.forBlock['rust_struct_init'] = function(block) {
    const name = block.getFieldValue('NAME');
    const fields = RustGenerator.statementToCode(block, 'FIELDS');
    
    return [`${name} {\n${fields}}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_field_init'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    
    return `    ${name}: ${value},\n`;
};

RustGenerator.forBlock['rust_tuple_struct'] = function(block) {
    const name = block.getFieldValue('NAME');
    const values = RustGenerator.valueToCode(block, 'VALUES', RustGenerator.ORDER_NONE) || '';
    
    return [`${name}(${values})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_enum_variant'] = function(block) {
    const enumName = block.getFieldValue('ENUM');
    const variant = block.getFieldValue('VARIANT');
    
    return [`${enumName}::${variant}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_enum_variant_value'] = function(block) {
    const enumName = block.getFieldValue('ENUM');
    const variant = block.getFieldValue('VARIANT');
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    
    return [`${enumName}::${variant}(${value})`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// VEC3 AND BEVY SYSTEM GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_vec3'] = function(block) {
    const x = RustGenerator.valueToCode(block, 'X', RustGenerator.ORDER_NONE) || '0.0';
    const y = RustGenerator.valueToCode(block, 'Y', RustGenerator.ORDER_NONE) || '0.0';
    const z = RustGenerator.valueToCode(block, 'Z', RustGenerator.ORDER_NONE) || '0.0';
    
    addImport('use bevy::prelude::*;');
    return [`Vec3::new(${x}, ${y}, ${z})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_bevy_system'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = RustGenerator.statementToCode(block, 'PARAMS');
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    const paramLines = params.trim().split('\n').filter(p => p.trim());
    const paramStr = paramLines.join(',\n    ');
    
    addImport('use bevy::prelude::*;');
    return `pub fn ${name}(\n    ${paramStr}\n) {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_query_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    const components = block.getFieldValue('COMPONENTS');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(components); // Detect component types
    return `mut ${name}: Query<(${components})>`;
};

RustGenerator.forBlock['rust_query_filtered'] = function(block) {
    const name = block.getFieldValue('NAME');
    const components = block.getFieldValue('COMPONENTS');
    const filter = block.getFieldValue('FILTER');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(components); // Detect component types
    autoDetectImports(filter); // Detect filter types
    return `mut ${name}: Query<(${components}), ${filter}>`;
};

RustGenerator.forBlock['rust_res_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(type); // Detect resource types
    return `${name}: Res<${type}>`;
};

RustGenerator.forBlock['rust_resmut_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(type); // Detect resource types
    return `mut ${name}: ResMut<${type}>`;
};

RustGenerator.forBlock['rust_commands_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    
    addImport('use bevy::prelude::*;');
    return `mut ${name}: Commands`;
};

RustGenerator.forBlock['rust_time_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(type); // Detect resource types
    return `${name}: Res<${type}>`;
};

RustGenerator.forBlock['rust_assets_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    const assetType = block.getFieldValue('ASSET_TYPE');
    
    addImport('use bevy::prelude::*;');
    autoDetectImports(assetType); // Detect asset types
    return `${name}: Res<Assets<${assetType}>>`;
};

RustGenerator.forBlock['rust_for_each'] = function(block) {
    const pattern = block.getFieldValue('PATTERN');
    const query = block.getFieldValue('QUERY');
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `for ${pattern} in ${query}.iter() {\n${body}}\n`;
};

RustGenerator.forBlock['rust_if_let'] = function(block) {
    const pattern = block.getFieldValue('PATTERN');
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || 'None';
    const then = RustGenerator.statementToCode(block, 'THEN');
    
    return `if let ${pattern} = ${expr} {\n${then}}\n`;
};

RustGenerator.forBlock['rust_component'] = function(block) {
    const struct = RustGenerator.valueToCode(block, 'STRUCT', RustGenerator.ORDER_NONE) || '';
    
    addImport('use bevy::prelude::*;');
    return `#[derive(Component)]\n${struct}`;
};

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

RustGenerator.forBlock['rust_query_iter'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const method = block.getFieldValue('METHOD');
    
    return [`${query}.${method}()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_count'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.iter().count()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_single'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.single()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_single_mut'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.single_mut()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_get'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const entity = RustGenerator.valueToCode(block, 'ENTITY', RustGenerator.ORDER_NONE) || 'entity';
    return [`${query}.get(${entity})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_get_mut'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const entity = RustGenerator.valueToCode(block, 'ENTITY', RustGenerator.ORDER_NONE) || 'entity';
    return [`${query}.get_mut(${entity})`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// MACRO GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_println'] = function(block) {
    const message = RustGenerator.valueToCode(block, 'MESSAGE', RustGenerator.ORDER_NONE) || '""';
    return `println!(${message});\n`;
};

RustGenerator.forBlock['rust_print'] = function(block) {
    const message = RustGenerator.valueToCode(block, 'MESSAGE', RustGenerator.ORDER_NONE) || '""';
    return `print!(${message});\n`;
};

RustGenerator.forBlock['rust_format'] = function(block) {
    const format = RustGenerator.valueToCode(block, 'FORMAT', RustGenerator.ORDER_NONE) || '""';
    return [`format!(${format})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_format_macro'] = function(block) {
    const format = RustGenerator.valueToCode(block, 'FORMAT', RustGenerator.ORDER_NONE) || '""';
    const args = RustGenerator.valueToCode(block, 'ARGS', RustGenerator.ORDER_NONE) || '';
    return [`format!(${format}, ${args})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_format_single'] = function(block) {
    const format = block.getFieldValue('FORMAT');
    const arg = RustGenerator.valueToCode(block, 'ARG', RustGenerator.ORDER_NONE) || 'value';
    return [`format!("${format}", ${arg})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_vec_macro'] = function(block) {
    const elements = RustGenerator.valueToCode(block, 'ELEMENTS', RustGenerator.ORDER_NONE) || '';
    return [`vec![${elements}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_panic'] = function(block) {
    const message = RustGenerator.valueToCode(block, 'MESSAGE', RustGenerator.ORDER_NONE) || '""';
    return `panic!(${message});\n`;
};

RustGenerator.forBlock['rust_assert'] = function(block) {
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'false';
    return `assert!(${condition});\n`;
};

RustGenerator.forBlock['rust_assert_eq'] = function(block) {
    const left = RustGenerator.valueToCode(block, 'LEFT', RustGenerator.ORDER_NONE) || '0';
    const right = RustGenerator.valueToCode(block, 'RIGHT', RustGenerator.ORDER_NONE) || '0';
    return `assert_eq!(${left}, ${right});\n`;
};

RustGenerator.forBlock['rust_dbg'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || 'value';
    return [`dbg!(${expr})`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// STRING GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_string_new'] = function(block) {
    return ['String::new()', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_from'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '""';
    return [`String::from(${value})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_to_string'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.to_string()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_literal'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return [`"${text}"`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_concat'] = function(block) {
    const left = RustGenerator.valueToCode(block, 'LEFT', RustGenerator.ORDER_ADDITIVE) || '""';
    const right = RustGenerator.valueToCode(block, 'RIGHT', RustGenerator.ORDER_ADDITIVE) || '""';
    return [`format!("{}{}", ${left}, ${right})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_push_str'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_NONE) || 'string';
    const text = RustGenerator.valueToCode(block, 'TEXT', RustGenerator.ORDER_NONE) || '""';
    return `${string}.push_str(${text});\n`;
};

RustGenerator.forBlock['rust_string_push'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_NONE) || 'string';
    const char = RustGenerator.valueToCode(block, 'CHAR', RustGenerator.ORDER_NONE) || "'a'";
    return `${string}.push(${char});\n`;
};

RustGenerator.forBlock['rust_string_len'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.len()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_is_empty'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.is_empty()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_contains'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const pattern = RustGenerator.valueToCode(block, 'PATTERN', RustGenerator.ORDER_NONE) || '""';
    return [`${string}.contains(${pattern})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_starts_with'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const pattern = RustGenerator.valueToCode(block, 'PATTERN', RustGenerator.ORDER_NONE) || '""';
    return [`${string}.starts_with(${pattern})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_ends_with'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const pattern = RustGenerator.valueToCode(block, 'PATTERN', RustGenerator.ORDER_NONE) || '""';
    return [`${string}.ends_with(${pattern})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_trim'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.trim()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_trim_start'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.trim_start()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_trim_end'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.trim_end()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_to_lowercase'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.to_lowercase()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_to_uppercase'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.to_uppercase()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_replace'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const from = RustGenerator.valueToCode(block, 'FROM', RustGenerator.ORDER_NONE) || '""';
    const to = RustGenerator.valueToCode(block, 'TO', RustGenerator.ORDER_NONE) || '""';
    return [`${string}.replace(${from}, ${to})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_replacen'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const from = RustGenerator.valueToCode(block, 'FROM', RustGenerator.ORDER_NONE) || '""';
    const to = RustGenerator.valueToCode(block, 'TO', RustGenerator.ORDER_NONE) || '""';
    const count = RustGenerator.valueToCode(block, 'COUNT', RustGenerator.ORDER_NONE) || '1';
    return [`${string}.replacen(${from}, ${to}, ${count})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_split'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const pattern = RustGenerator.valueToCode(block, 'PATTERN', RustGenerator.ORDER_NONE) || '""';
    return [`${string}.split(${pattern})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_split_whitespace'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.split_whitespace()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_lines'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.lines()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_chars'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.chars()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_bytes'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.bytes()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_parse'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.parse()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_parse_typed'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const type = block.getFieldValue('TYPE');
    return [`${string}.parse::<${type}>()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_slice'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    const start = RustGenerator.valueToCode(block, 'START', RustGenerator.ORDER_NONE) || '0';
    const end = RustGenerator.valueToCode(block, 'END', RustGenerator.ORDER_NONE) || 'string.len()';
    return [`&${string}[${start}..${end}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_as_str'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_ATOMIC) || 'string';
    return [`${string}.as_str()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_string_clear'] = function(block) {
    const string = RustGenerator.valueToCode(block, 'STRING', RustGenerator.ORDER_NONE) || 'string';
    return `${string}.clear();\n`;
};

// ============================================================================
// MATH GENERATORS
// ============================================================================

RustGenerator.forBlock['rust_abs'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.abs()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_pow'] = function(block) {
    const base = RustGenerator.valueToCode(block, 'BASE', RustGenerator.ORDER_ATOMIC) || '0.0';
    const exponent = RustGenerator.valueToCode(block, 'EXPONENT', RustGenerator.ORDER_NONE) || '2.0';
    return [`${base}.powf(${exponent})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_sqrt'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.sqrt()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_cbrt'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.cbrt()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_min'] = function(block) {
    const a = RustGenerator.valueToCode(block, 'A', RustGenerator.ORDER_ATOMIC) || '0.0';
    const b = RustGenerator.valueToCode(block, 'B', RustGenerator.ORDER_NONE) || '0.0';
    return [`${a}.min(${b})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_max'] = function(block) {
    const a = RustGenerator.valueToCode(block, 'A', RustGenerator.ORDER_ATOMIC) || '0.0';
    const b = RustGenerator.valueToCode(block, 'B', RustGenerator.ORDER_NONE) || '0.0';
    return [`${a}.max(${b})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_clamp'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    const min = RustGenerator.valueToCode(block, 'MIN', RustGenerator.ORDER_NONE) || '0.0';
    const max = RustGenerator.valueToCode(block, 'MAX', RustGenerator.ORDER_NONE) || '1.0';
    return [`${value}.clamp(${min}, ${max})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_floor'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.floor()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_ceil'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.ceil()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_round'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.round()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_trunc'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.trunc()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_fract'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.fract()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_sin'] = function(block) {
    const angle = RustGenerator.valueToCode(block, 'ANGLE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${angle}.sin()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_cos'] = function(block) {
    const angle = RustGenerator.valueToCode(block, 'ANGLE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${angle}.cos()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_tan'] = function(block) {
    const angle = RustGenerator.valueToCode(block, 'ANGLE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${angle}.tan()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_asin'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.asin()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_acos'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.acos()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_atan'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.atan()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_atan2'] = function(block) {
    const y = RustGenerator.valueToCode(block, 'Y', RustGenerator.ORDER_ATOMIC) || '0.0';
    const x = RustGenerator.valueToCode(block, 'X', RustGenerator.ORDER_NONE) || '1.0';
    return [`${y}.atan2(${x})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_to_radians'] = function(block) {
    const degrees = RustGenerator.valueToCode(block, 'DEGREES', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${degrees}.to_radians()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_to_degrees'] = function(block) {
    const radians = RustGenerator.valueToCode(block, 'RADIANS', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${radians}.to_degrees()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_exp'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.exp()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_exp2'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.exp2()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_ln'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '1.0';
    return [`${value}.ln()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_log2'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '1.0';
    return [`${value}.log2()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_log10'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '1.0';
    return [`${value}.log10()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_log'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '1.0';
    const base = RustGenerator.valueToCode(block, 'BASE', RustGenerator.ORDER_NONE) || '10.0';
    return [`${value}.log(${base})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_pi'] = function(block) {
    return ['std::f32::consts::PI', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_e'] = function(block) {
    return ['std::f32::consts::E', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_tau'] = function(block) {
    return ['std::f32::consts::TAU', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_signum'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.signum()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_sign_positive'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.is_sign_positive()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_sign_negative'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.is_sign_negative()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_finite'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.is_finite()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_infinite'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.is_infinite()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_nan'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || '0.0';
    return [`${value}.is_nan()`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// COLLECTIONS AND ITERATORS
// ============================================================================

RustGenerator.forBlock['rust_array_literal'] = function(block) {
    const elements = RustGenerator.valueToCode(block, 'ELEMENTS', RustGenerator.ORDER_NONE) || '';
    return [`[${elements}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_array_typed'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '0';
    const size = RustGenerator.valueToCode(block, 'SIZE', RustGenerator.ORDER_NONE) || '0';
    return [`[${value}; ${size}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_slice'] = function(block) {
    const array = RustGenerator.valueToCode(block, 'ARRAY', RustGenerator.ORDER_ATOMIC) || 'array';
    const start = RustGenerator.valueToCode(block, 'START', RustGenerator.ORDER_NONE) || '0';
    const end = RustGenerator.valueToCode(block, 'END', RustGenerator.ORDER_NONE) || 'array.len()';
    return [`&${array}[${start}..${end}]`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_range'] = function(block) {
    const start = RustGenerator.valueToCode(block, 'START', RustGenerator.ORDER_NONE) || '0';
    const end = RustGenerator.valueToCode(block, 'END', RustGenerator.ORDER_NONE) || '10';
    return [`${start}..${end}`, RustGenerator.ORDER_RANGE];
};

RustGenerator.forBlock['rust_range_inclusive'] = function(block) {
    const start = RustGenerator.valueToCode(block, 'START', RustGenerator.ORDER_NONE) || '0';
    const end = RustGenerator.valueToCode(block, 'END', RustGenerator.ORDER_NONE) || '10';
    return [`${start}..=${end}`, RustGenerator.ORDER_RANGE];
};

RustGenerator.forBlock['rust_array_len'] = function(block) {
    const array = RustGenerator.valueToCode(block, 'ARRAY', RustGenerator.ORDER_ATOMIC) || 'array';
    return [`${array}.len()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_array_is_empty'] = function(block) {
    const array = RustGenerator.valueToCode(block, 'ARRAY', RustGenerator.ORDER_ATOMIC) || 'array';
    return [`${array}.is_empty()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter'] = function(block) {
    const collection = RustGenerator.valueToCode(block, 'COLLECTION', RustGenerator.ORDER_ATOMIC) || 'collection';
    return [`${collection}.iter()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_mut'] = function(block) {
    const collection = RustGenerator.valueToCode(block, 'COLLECTION', RustGenerator.ORDER_ATOMIC) || 'collection';
    return [`${collection}.iter_mut()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_into_iter'] = function(block) {
    const collection = RustGenerator.valueToCode(block, 'COLLECTION', RustGenerator.ORDER_ATOMIC) || 'collection';
    return [`${collection}.into_iter()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_map'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const param = block.getFieldValue('PARAM');
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || param;
    return [`${iterator}.map(|${param}| ${expr})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_filter'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const param = block.getFieldValue('PARAM');
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'true';
    return [`${iterator}.filter(|${param}| ${condition})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_collect'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.collect()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_collect_typed'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const type = block.getFieldValue('TYPE');
    return [`${iterator}.collect::<${type}>()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_fold'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const init = RustGenerator.valueToCode(block, 'INIT', RustGenerator.ORDER_NONE) || '0';
    const acc = block.getFieldValue('ACC');
    const item = block.getFieldValue('ITEM');
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_NONE) || acc;
    return [`${iterator}.fold(${init}, |${acc}, ${item}| ${expr})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_sum'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.sum()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_count'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.count()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_any'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const param = block.getFieldValue('PARAM');
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'true';
    return [`${iterator}.any(|${param}| ${condition})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_all'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const param = block.getFieldValue('PARAM');
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'true';
    return [`${iterator}.all(|${param}| ${condition})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_find'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const param = block.getFieldValue('PARAM');
    const condition = RustGenerator.valueToCode(block, 'CONDITION', RustGenerator.ORDER_NONE) || 'true';
    return [`${iterator}.find(|${param}| ${condition})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_take'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const n = RustGenerator.valueToCode(block, 'N', RustGenerator.ORDER_NONE) || '10';
    return [`${iterator}.take(${n})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_skip'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    const n = RustGenerator.valueToCode(block, 'N', RustGenerator.ORDER_NONE) || '10';
    return [`${iterator}.skip(${n})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_enumerate'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.enumerate()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_zip'] = function(block) {
    const iterator1 = RustGenerator.valueToCode(block, 'ITERATOR1', RustGenerator.ORDER_ATOMIC) || 'iter1';
    const iterator2 = RustGenerator.valueToCode(block, 'ITERATOR2', RustGenerator.ORDER_NONE) || 'iter2';
    return [`${iterator1}.zip(${iterator2})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_chain'] = function(block) {
    const iterator1 = RustGenerator.valueToCode(block, 'ITERATOR1', RustGenerator.ORDER_ATOMIC) || 'iter1';
    const iterator2 = RustGenerator.valueToCode(block, 'ITERATOR2', RustGenerator.ORDER_NONE) || 'iter2';
    return [`${iterator1}.chain(${iterator2})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_max'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.max()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_min'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.min()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_iter_reverse'] = function(block) {
    const iterator = RustGenerator.valueToCode(block, 'ITERATOR', RustGenerator.ORDER_ATOMIC) || 'iter';
    return [`${iterator}.rev()`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

RustGenerator.forBlock['rust_result_ok'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    return [`Ok(${value})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_result_err'] = function(block) {
    const error = RustGenerator.valueToCode(block, 'ERROR', RustGenerator.ORDER_NONE) || '""';
    return [`Err(${error})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_option_some'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    return [`Some(${value})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_option_none'] = function(block) {
    return ['None', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_unwrap'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.unwrap()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_unwrap_or'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    const default_val = RustGenerator.valueToCode(block, 'DEFAULT', RustGenerator.ORDER_NONE) || '()';
    return [`${value}.unwrap_or(${default_val})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_expect'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    const message = RustGenerator.valueToCode(block, 'MESSAGE', RustGenerator.ORDER_NONE) || '""';
    return [`${value}.expect(${message})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_ok'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.is_ok()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_err'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.is_err()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_some'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.is_some()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_is_none'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}.is_none()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_question_mark'] = function(block) {
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_ATOMIC) || 'value';
    return [`${value}?`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ASYNC/AWAIT
// ============================================================================

RustGenerator.forBlock['rust_async_function'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = RustGenerator.valueToCode(block, 'PARAMS_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const returnType = RustGenerator.valueToCode(block, 'RETURN_TYPE_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `async fn ${name}(${params})${returnType} {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_await'] = function(block) {
    const expr = RustGenerator.valueToCode(block, 'EXPR', RustGenerator.ORDER_ATOMIC) || 'future';
    return [`${expr}.await`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_async_block'] = function(block) {
    const body = RustGenerator.statementToCode(block, 'BODY');
    return [`async {\n${body}}`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// LIFETIMES
// ============================================================================

RustGenerator.forBlock['rust_lifetime_param'] = function(block) {
    const name = block.getFieldValue('NAME');
    return [`'${name}`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_lifetime_annotation'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    return [`&'${name} ${type}`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// TRAITS
// ============================================================================

RustGenerator.forBlock['rust_trait_def'] = function(block) {
    const name = block.getFieldValue('NAME');
    const methods = RustGenerator.statementToCode(block, 'METHODS');
    
    return `trait ${name} {\n${methods}}\n\n`;
};

RustGenerator.forBlock['rust_trait_method'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = RustGenerator.valueToCode(block, 'PARAMS_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    const returnType = RustGenerator.valueToCode(block, 'RETURN_TYPE_OPTIONAL', RustGenerator.ORDER_NONE) || '';
    
    return `    fn ${name}(${params})${returnType};\n`;
};

// ============================================================================
// FILE ORGANIZATION
// ============================================================================

RustGenerator.forBlock['file_container'] = function(block) {
    // File container doesn't generate code itself
    // It just organizes blocks - the multi-file generator handles it
    const contents = RustGenerator.statementToCode(block, 'CONTENTS');
    return contents;
};

// ============================================================================
// MODULES
// ============================================================================

RustGenerator.forBlock['rust_mod'] = function(block) {
    const name = block.getFieldValue('NAME');
    const body = RustGenerator.statementToCode(block, 'BODY');
    
    return `mod ${name} {\n${body}}\n\n`;
};

RustGenerator.forBlock['rust_mod_file'] = function(block) {
    const name = block.getFieldValue('NAME');
    return `mod ${name};\n`;
};

RustGenerator.forBlock['rust_use'] = function(block) {
    const path = block.getFieldValue('PATH');
    addImport(`use ${path};`);
    return '';
};

RustGenerator.forBlock['rust_pub_use'] = function(block) {
    const path = block.getFieldValue('PATH');
    addImport(`pub use ${path};`);
    return '';
};

RustGenerator.forBlock['rust_extern_crate'] = function(block) {
    const name = block.getFieldValue('NAME');
    addImport(`extern crate ${name};`);
    return '';
};

// ============================================================================
// COMMENTS
// ============================================================================

RustGenerator.forBlock['rust_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `// ${text}\n`;
};

RustGenerator.forBlock['rust_doc_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `/// ${text}\n`;
};

RustGenerator.forBlock['rust_block_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `/* ${text} */\n`;
};

// ============================================================================
// HELPER FUNCTION: Check if all blocks have generators
// ============================================================================

/**
 * Validate that all blocks in the workspace have generators
 * @param {Blockly.Workspace} workspace - The workspace to validate
 * @returns {Object} Validation result with missing blocks
 */
function validateGeneratorCompleteness(workspace) {
    const blocks = workspace.getAllBlocks();
    const missingGenerators = [];
    
    for (const block of blocks) {
        if (!RustGenerator.forBlock[block.type]) {
            missingGenerators.push(block.type);
        }
    }
    
    if (missingGenerators.length > 0) {
        console.error('Missing generators for blocks:', missingGenerators);
        return {
            valid: false,
            missingGenerators: [...new Set(missingGenerators)]
        };
    }
    
    return {
        valid: true,
        missingGenerators: []
    };
}

// ============================================================================
// CROSS-MODE REFERENCE BLOCKS
// ============================================================================

RustGenerator.forBlock['rust_reference_node'] = function(block) {
    const targetFile = block.getFieldValue('TARGET_FILE');
    const targetSymbol = block.getFieldValue('TARGET_SYMBOL');
    const description = block.getFieldValue('DESCRIPTION');
    
    // Infer target mode from file extension
    let targetMode = 'rust';
    if (targetFile.endsWith('.wgsl')) {
        targetMode = 'wgsl';
    } else if (targetFile.includes('system') || targetFile.includes('bevy')) {
        targetMode = 'bevy';
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
    } else if (targetMode === 'rust' || targetMode === 'bevy') {
        // Rust/Bevy reference - generate use statement
        if (targetSymbol) {
            // Convert filename to module path (e.g., "utils.rs" -> "crate::utils")
            const modulePath = targetFile.replace('.rs', '').replace(/\//g, '::');
            const importStatement = `use crate::${modulePath}::${targetSymbol};`;
            addImport(importStatement);
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
// QUERY OPERATIONS (Additional)
// ============================================================================

RustGenerator.forBlock['rust_query_iter'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const method = block.getFieldValue('METHOD');
    return [`${query}.${method}()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_count'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.iter().count()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_single'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.single()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_single_mut'] = function(block) {
    const query = block.getFieldValue('QUERY');
    return [`${query}.single_mut()`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_get'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const entity = RustGenerator.valueToCode(block, 'ENTITY', RustGenerator.ORDER_NONE) || 'entity';
    return [`${query}.get(${entity})`, RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_query_get_mut'] = function(block) {
    const query = block.getFieldValue('QUERY');
    const entity = RustGenerator.valueToCode(block, 'ENTITY', RustGenerator.ORDER_NONE) || 'entity';
    return [`${query}.get_mut(${entity})`, RustGenerator.ORDER_ATOMIC];
};

// Duplicate definitions removed - see earlier in file

// ============================================================================
// COMMENTS
// ============================================================================

RustGenerator.forBlock['rust_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `// ${text}\n`;
};

RustGenerator.forBlock['rust_doc_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `/// ${text}\n`;
};

// ============================================================================
// ADDITIONAL COLLECTIONS
// ============================================================================

RustGenerator.forBlock['rust_vec_new'] = function(block) {
    return ['Vec::new()', RustGenerator.ORDER_ATOMIC];
};

RustGenerator.forBlock['rust_vec_push'] = function(block) {
    const vec = block.getFieldValue('VEC');
    const value = RustGenerator.valueToCode(block, 'VALUE', RustGenerator.ORDER_NONE) || '()';
    return `${vec}.push(${value});\n`;
};

RustGenerator.forBlock['rust_vec_len'] = function(block) {
    const vec = block.getFieldValue('VEC');
    return [`${vec}.len()`, RustGenerator.ORDER_ATOMIC];
};

// ============================================================================
// EXPORT
// ============================================================================

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RustGenerator,
        validateGeneratorCompleteness,
        addImport,
        clearImports,
        generateImports
    };
}
