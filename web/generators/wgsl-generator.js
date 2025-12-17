/**
 * Consolidated WGSL Code Generator for Blockly System
 * 
 * This generator consolidates all WGSL block generators with enhanced features:
 * - Template-based code generation using TemplateEngine
 * - Code syntax validation
 * - Fallback to custom generator functions
 * - Support for cross-mode type compatibility
 * 
 * Merged from: wgsl_generator.js, comprehensive_wgsl_generators.js, comprehensive_math_generators.js
 * Requirements: 3.1, 3.2, 3.3, 8.1, 8.2, 8.3
 */

// Initialize WGSL Generator
const WgslGenerator = new Blockly.Generator('WGSL');

// Set operator precedence
WgslGenerator.PRECEDENCE = 0;
WgslGenerator.ORDER_ATOMIC = 0;
WgslGenerator.ORDER_UNARY = 1;
WgslGenerator.ORDER_MULTIPLICATIVE = 2;
WgslGenerator.ORDER_ADDITIVE = 3;
WgslGenerator.ORDER_RELATIONAL = 4;
WgslGenerator.ORDER_EQUALITY = 5;
WgslGenerator.ORDER_LOGICAL_AND = 6;
WgslGenerator.ORDER_LOGICAL_OR = 7;
WgslGenerator.ORDER_NONE = 99;

// Initialize Template Engine (assumes template-engine.js is loaded)
const wgslTemplateEngine = typeof TemplateEngine !== 'undefined' ? new TemplateEngine() : null;

/**
 * Process a block using template-based generation or custom generator
 */
function processWgslBlockWithTemplate(block, generatorFn) {
    // Check if template engine is available and block has a template
    if (wgslTemplateEngine && block.template && typeof block.template === 'string') {
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
                    const value = WgslGenerator.valueToCode(block, input.name, WgslGenerator.ORDER_NONE);
                    context[input.name] = value || '';
                }
            });
            
            // Get all statement inputs
            block.inputList.forEach(input => {
                if (input.type === Blockly.inputTypes.STATEMENT && input.name) {
                    const statements = WgslGenerator.statementToCode(block, input.name);
                    context[input.name] = statements || '';
                }
            });
            
            // Process template
            const code = wgslTemplateEngine.process(block.template, context);
            
            // Validate template syntax
            if (!wgslTemplateEngine.validateTemplate(block.template)) {
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
WgslGenerator.scrub_ = function(block, code, thisOnly) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    if (nextBlock && !thisOnly) {
        return code + '\n' + WgslGenerator.blockToCode(nextBlock);
    }
    return code;
};

/**
 * Override workspaceToCode to add validation
 */
WgslGenerator.workspaceToCode = function(workspace) {
    // Generate code for all blocks
    let code = [];
    const blocks = workspace.getTopBlocks(true);
    for (let i = 0; i < blocks.length; i++) {
        let blockCode = WgslGenerator.blockToCode(blocks[i]);
        if (Array.isArray(blockCode)) {
            blockCode = blockCode[0];
        }
        if (blockCode) {
            code.push(blockCode);
        }
    }
    
    const fullCode = code.join('\n');
    
    // Validate generated code (basic syntax check)
    if (!validateWgslSyntax(fullCode)) {
        console.warn('Generated WGSL code may have syntax issues');
    }
    
    return fullCode;
};

/**
 * Basic WGSL syntax validation
 */
function validateWgslSyntax(code) {
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
        console.error('Unbalanced braces, parentheses, or brackets in generated WGSL code');
        return false;
    }
    
    return true;
}

// ============================================================================
// FILE ORGANIZATION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_file_container'] = function(block) {
    // File container doesn't generate code itself
    // It just organizes blocks - the multi-file generator handles it
    const contents = WgslGenerator.statementToCode(block, 'CONTENTS');
    return contents;
};

// ============================================================================
// SHADER ENTRY POINT GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_compute_shader'] = function(block) {
    const workgroupSize = block.getFieldValue('WORKGROUP_SIZE');
    const bindings = WgslGenerator.statementToCode(block, 'BINDINGS');
    const main = WgslGenerator.statementToCode(block, 'MAIN');
    
    return `// Generated WGSL Compute Shader

${bindings}

@compute @workgroup_size(${workgroupSize})
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
${main}}
`;
};

WgslGenerator.forBlock['wgsl_compute_shader_full'] = function(block) {
    const x = block.getFieldValue('X');
    const y = block.getFieldValue('Y');
    const z = block.getFieldValue('Z');
    const name = block.getFieldValue('NAME');
    const params = WgslGenerator.valueToCode(block, 'PARAMS', WgslGenerator.ORDER_NONE) || '';
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `@compute @workgroup_size(${x}, ${y}, ${z})
fn ${name}(${params}) {
${body}}

`;
};

WgslGenerator.forBlock['wgsl_vertex_shader'] = function(block) {
    const name = block.getFieldValue('NAME');
    const input = WgslGenerator.valueToCode(block, 'INPUT', WgslGenerator.ORDER_NONE) || 'VertexInput';
    const output = WgslGenerator.valueToCode(block, 'OUTPUT', WgslGenerator.ORDER_NONE) || 'VertexOutput';
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `@vertex
fn ${name}(in: ${input}) -> ${output} {
${body}}

`;
};

WgslGenerator.forBlock['wgsl_fragment_shader'] = function(block) {
    const name = block.getFieldValue('NAME');
    const input = WgslGenerator.valueToCode(block, 'INPUT', WgslGenerator.ORDER_NONE) || 'FragmentInput';
    const output = WgslGenerator.valueToCode(block, 'OUTPUT', WgslGenerator.ORDER_NONE) || 'FragmentOutput';
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `@fragment
fn ${name}(in: ${input}) -> ${output} {
${body}}

`;
};

// ============================================================================
// STRUCT GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_struct'] = function(block) {
    const name = block.getFieldValue('NAME');
    const fields = WgslGenerator.statementToCode(block, 'FIELDS');
    
    return `struct ${name} {
${fields}}

`;
};

WgslGenerator.forBlock['wgsl_struct_field'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    ${name}: ${type},\n`;
};

WgslGenerator.forBlock['wgsl_struct_field_location'] = function(block) {
    const location = block.getFieldValue('LOCATION');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    @location(${location}) ${name}: ${type},\n`;
};

WgslGenerator.forBlock['wgsl_struct_field_builtin'] = function(block) {
    const builtin = block.getFieldValue('BUILTIN');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    @builtin(${builtin}) ${name}: ${type},\n`;
};

WgslGenerator.forBlock['wgsl_struct_field_align'] = function(block) {
    const align = block.getFieldValue('ALIGN');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    @align(${align}) ${name}: ${type},\n`;
};

WgslGenerator.forBlock['wgsl_struct_field_size'] = function(block) {
    const size = block.getFieldValue('SIZE');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    @size(${size}) ${name}: ${type},\n`;
};

WgslGenerator.forBlock['wgsl_struct_field_align_size'] = function(block) {
    const align = block.getFieldValue('ALIGN');
    const size = block.getFieldValue('SIZE');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `    @align(${align}) @size(${size}) ${name}: ${type},\n`;
};

// Padding field generators
WgslGenerator.forBlock['wgsl_padding_vec4'] = function(block) {
    const index = block.getFieldValue('INDEX');
    return `    _padding${index}: vec4<f32>,  // padding for alignment\n`;
};

WgslGenerator.forBlock['wgsl_padding_vec3'] = function(block) {
    const index = block.getFieldValue('INDEX');
    return `    _padding${index}: vec3<f32>,  // padding for alignment\n`;
};

WgslGenerator.forBlock['wgsl_padding_vec2'] = function(block) {
    const index = block.getFieldValue('INDEX');
    return `    _padding${index}: vec2<f32>,  // padding for alignment\n`;
};

WgslGenerator.forBlock['wgsl_padding_f32'] = function(block) {
    const index = block.getFieldValue('INDEX');
    return `    _padding${index}: f32,  // padding for alignment\n`;
};

WgslGenerator.forBlock['wgsl_packed_vec3'] = function(block) {
    const name = block.getFieldValue('NAME');
    return `    ${name}: vec3<f32>,  // 12 bytes (no padding)\n`;
};

WgslGenerator.forBlock['wgsl_aligned_vec4'] = function(block) {
    const name = block.getFieldValue('NAME');
    return `    ${name}: vec4<f32>,  // 16 bytes (aligned)\n`;
};

// ============================================================================
// BINDING GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_storage_buffer'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const access = block.getFieldValue('ACCESS');
    
    return `@group(${group}) @binding(${binding})
var<storage, ${access}> ${name}: ${type};

`;
};

WgslGenerator.forBlock['wgsl_storage_buffer_full'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const access = block.getFieldValue('ACCESS');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `@group(${group}) @binding(${binding})
var<storage, ${access}> ${name}: ${type};

`;
};

WgslGenerator.forBlock['wgsl_uniform_buffer'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `@group(${group}) @binding(${binding})
var<uniform> ${name}: ${type};

`;
};

WgslGenerator.forBlock['wgsl_uniform_buffer_full'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `@group(${group}) @binding(${binding})
var<uniform> ${name}: ${type};

`;
};

WgslGenerator.forBlock['wgsl_texture_2d'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    const format = block.getFieldValue('FORMAT');
    
    return `@group(${group}) @binding(${binding})
var ${name}: texture_2d<${format}>;

`;
};

WgslGenerator.forBlock['wgsl_sampler'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    
    return `@group(${group}) @binding(${binding})
var ${name}: sampler;

`;
};

// ============================================================================
// VARIABLE DECLARATION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_var_declare'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return `var ${name} = ${value};\n`;
};

WgslGenerator.forBlock['wgsl_let'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return `let ${name} = ${value};\n`;
};

WgslGenerator.forBlock['wgsl_var_typed'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return `var ${name}: ${type} = ${value};\n`;
};

WgslGenerator.forBlock['wgsl_assign'] = function(block) {
    const target = WgslGenerator.valueToCode(block, 'TARGET', WgslGenerator.ORDER_NONE) || 'variable';
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return `${target} = ${value};\n`;
};

WgslGenerator.forBlock['wgsl_compound_assign'] = function(block) {
    const target = WgslGenerator.valueToCode(block, 'TARGET', WgslGenerator.ORDER_NONE) || 'variable';
    const op = block.getFieldValue('OP');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return `${target} ${op} ${value};\n`;
};

// ============================================================================
// CONTROL FLOW GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_if'] = function(block) {
    const condition = WgslGenerator.valueToCode(block, 'CONDITION', WgslGenerator.ORDER_NONE) || 'false';
    const then = WgslGenerator.statementToCode(block, 'THEN');
    
    return `if (${condition}) {
${then}}
`;
};

WgslGenerator.forBlock['wgsl_if_else'] = function(block) {
    const condition = WgslGenerator.valueToCode(block, 'CONDITION', WgslGenerator.ORDER_NONE) || 'false';
    const thenBlock = WgslGenerator.statementToCode(block, 'THEN');
    const elseBlock = WgslGenerator.statementToCode(block, 'ELSE');
    
    return `if (${condition}) {
${thenBlock}} else {
${elseBlock}}
`;
};

WgslGenerator.forBlock['wgsl_for_loop'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const start = block.getFieldValue('START');
    const end = block.getFieldValue('END');
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `for (var ${varName}: u32 = ${start}u; ${varName} < ${end}; ${varName}++) {
${body}}
`;
};

WgslGenerator.forBlock['wgsl_for_loop_full'] = function(block) {
    const varName = block.getFieldValue('VAR');
    const init = WgslGenerator.valueToCode(block, 'INIT', WgslGenerator.ORDER_NONE) || '0';
    const condition = WgslGenerator.valueToCode(block, 'CONDITION', WgslGenerator.ORDER_NONE) || `${varName} < 10`;
    const update = WgslGenerator.valueToCode(block, 'UPDATE', WgslGenerator.ORDER_NONE) || `${varName} = ${varName} + 1`;
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `for (var ${varName} = ${init}; ${condition}; ${update}) {
${body}}
`;
};

WgslGenerator.forBlock['wgsl_while'] = function(block) {
    const condition = WgslGenerator.valueToCode(block, 'CONDITION', WgslGenerator.ORDER_NONE) || 'false';
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `while (${condition}) {
${body}}
`;
};

WgslGenerator.forBlock['wgsl_loop'] = function(block) {
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `loop {
${body}}
`;
};

WgslGenerator.forBlock['wgsl_break'] = function(block) {
    return `break;\n`;
};

WgslGenerator.forBlock['wgsl_continue'] = function(block) {
    return `continue;\n`;
};

WgslGenerator.forBlock['wgsl_return'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '()';
    
    return `return ${value};\n`;
};

// ============================================================================
// VECTOR & MATRIX GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_vec2'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`vec2<${type}>(${x}, ${y})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_vec3'] = function(block) {
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    const z = WgslGenerator.valueToCode(block, 'Z', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`vec3<f32>(${x}, ${y}, ${z})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_vec3_typed'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    const z = WgslGenerator.valueToCode(block, 'Z', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`vec3<${type}>(${x}, ${y}, ${z})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_vec4'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    const z = WgslGenerator.valueToCode(block, 'Z', WgslGenerator.ORDER_NONE) || '0.0';
    const w = WgslGenerator.valueToCode(block, 'W', WgslGenerator.ORDER_NONE) || '1.0';
    
    return [`vec4<${type}>(${x}, ${y}, ${z}, ${w})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_mat4x4'] = function(block) {
    const values = WgslGenerator.valueToCode(block, 'VALUES', WgslGenerator.ORDER_NONE) || '';
    
    return [`mat4x4<f32>(${values})`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// BUILT-IN FUNCTION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_builtin_func'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const args = WgslGenerator.valueToCode(block, 'ARGS', WgslGenerator.ORDER_NONE) || '';
    
    return [`${func}(${args})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_math_func'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const args = WgslGenerator.valueToCode(block, 'ARGS', WgslGenerator.ORDER_NONE) || '';
    
    return [`${func}(${args})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_texture_func'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const texture = WgslGenerator.valueToCode(block, 'TEXTURE', WgslGenerator.ORDER_NONE) || 'texture';
    const arg1 = WgslGenerator.valueToCode(block, 'ARG1', WgslGenerator.ORDER_NONE) || '';
    const arg2 = WgslGenerator.valueToCode(block, 'ARG2', WgslGenerator.ORDER_NONE) || '';
    
    const args = [texture, arg1, arg2].filter(a => a).join(', ');
    return [`${func}(${args})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_atomic_func'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const ptr = WgslGenerator.valueToCode(block, 'PTR', WgslGenerator.ORDER_NONE) || 'ptr';
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0';
    
    return [`${func}(${ptr}, ${value})`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// EXPRESSION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_math_op'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '0.0';
    const op = block.getFieldValue('OP');
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`${a} ${op} ${b}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_binary_op'] = function(block) {
    const left = WgslGenerator.valueToCode(block, 'LEFT', WgslGenerator.ORDER_NONE) || '0.0';
    const op = block.getFieldValue('OP');
    const right = WgslGenerator.valueToCode(block, 'RIGHT', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`${left} ${op} ${right}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_unary_op'] = function(block) {
    const op = block.getFieldValue('OP');
    const expr = WgslGenerator.valueToCode(block, 'EXPR', WgslGenerator.ORDER_NONE) || 'value';
    
    return [`${op}${expr}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_cast'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0';
    
    return [`${type}(${value})`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// LITERAL GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_number'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [`${value}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_float'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [`${value}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_int'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [`${value}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_bool'] = function(block) {
    const value = block.getFieldValue('VALUE');
    return [value, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// VARIABLE & FIELD ACCESS GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_var_ref'] = function(block) {
    const name = block.getFieldValue('NAME');
    return [`${name}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_array_access'] = function(block) {
    const array = block.getFieldValue('ARRAY');
    const index = WgslGenerator.valueToCode(block, 'INDEX', WgslGenerator.ORDER_NONE) || '0';
    
    return [`${array}[${index}]`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_field_access'] = function(block) {
    const object = WgslGenerator.valueToCode(block, 'OBJECT', WgslGenerator.ORDER_NONE) || 'obj';
    const field = block.getFieldValue('FIELD');
    
    return [`${object}.${field}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_index'] = function(block) {
    const array = WgslGenerator.valueToCode(block, 'ARRAY', WgslGenerator.ORDER_NONE) || 'array';
    const index = WgslGenerator.valueToCode(block, 'INDEX', WgslGenerator.ORDER_NONE) || '0';
    
    return [`${array}[${index}]`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_array_length'] = function(block) {
    const array = WgslGenerator.valueToCode(block, 'ARRAY', WgslGenerator.ORDER_NONE) || 'array';
    
    return [`arrayLength(&${array})`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// FUNCTION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_function'] = function(block) {
    const name = block.getFieldValue('NAME');
    const params = block.getFieldValue('PARAMS');
    const returnType = block.getFieldValue('RETURN_TYPE');
    const body = WgslGenerator.statementToCode(block, 'BODY');
    
    return `fn ${name}(${params}) -> ${returnType} {
${body}}

`;
};

WgslGenerator.forBlock['wgsl_call'] = function(block) {
    const func = block.getFieldValue('FUNCTION');
    const args = WgslGenerator.valueToCode(block, 'ARGS', WgslGenerator.ORDER_NONE) || '';
    
    return [`${func}(${args})`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// COMMENT GENERATOR
// ============================================================================

WgslGenerator.forBlock['wgsl_comment'] = function(block) {
    const text = block.getFieldValue('TEXT');
    return `// ${text}\n`;
};

// ============================================================================
// MATH GENERATORS (from comprehensive_math_generators.js)
// ============================================================================

// Vector3 Operations
WgslGenerator.forBlock['vec3_new'] = function(block) {
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    const z = WgslGenerator.valueToCode(block, 'Z', WgslGenerator.ORDER_NONE) || '0.0';
    return [`vec3<f32>(${x}, ${y}, ${z})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_constant'] = function(block) {
    const constant = block.getFieldValue('CONSTANT');
    const constants = {
        'ZERO': 'vec3<f32>(0.0, 0.0, 0.0)',
        'ONE': 'vec3<f32>(1.0, 1.0, 1.0)',
        'X': 'vec3<f32>(1.0, 0.0, 0.0)',
        'Y': 'vec3<f32>(0.0, 1.0, 0.0)',
        'Z': 'vec3<f32>(0.0, 0.0, 1.0)',
        'NEG_X': 'vec3<f32>(-1.0, 0.0, 0.0)',
        'NEG_Y': 'vec3<f32>(0.0, -1.0, 0.0)',
        'NEG_Z': 'vec3<f32>(0.0, 0.0, -1.0)'
    };
    return [constants[constant], WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_length'] = function(block) {
    const vec = WgslGenerator.valueToCode(block, 'VEC', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`length(${vec})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_length_squared'] = function(block) {
    const vec = WgslGenerator.valueToCode(block, 'VEC', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`dot(${vec}, ${vec})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_normalize'] = function(block) {
    const vec = WgslGenerator.valueToCode(block, 'VEC', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`normalize(${vec})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_dot'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`dot(${a}, ${b})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_cross'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`cross(${a}, ${b})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_distance'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    return [`distance(${a}, ${b})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_lerp'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const t = WgslGenerator.valueToCode(block, 'T', WgslGenerator.ORDER_NONE) || '0.0';
    return [`mix(${a}, ${b}, ${t})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['vec3_clamp_length'] = function(block) {
    const vec = WgslGenerator.valueToCode(block, 'VEC', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const min = WgslGenerator.valueToCode(block, 'MIN', WgslGenerator.ORDER_NONE) || '0.0';
    const max = WgslGenerator.valueToCode(block, 'MAX', WgslGenerator.ORDER_NONE) || '1.0';
    return [`normalize(${vec}) * clamp(length(${vec}), ${min}, ${max})`, WgslGenerator.ORDER_ATOMIC];
};

// Trigonometric Functions
WgslGenerator.forBlock['math_trig'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`${func}(${value})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_atan2'] = function(block) {
    const y = WgslGenerator.valueToCode(block, 'Y', WgslGenerator.ORDER_NONE) || '0.0';
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '1.0';
    return [`atan2(${y}, ${x})`, WgslGenerator.ORDER_ATOMIC];
};

// Exponential & Logarithmic
WgslGenerator.forBlock['math_exp_log'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`${func}(${value})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_pow'] = function(block) {
    const base = WgslGenerator.valueToCode(block, 'BASE', WgslGenerator.ORDER_NONE) || '0.0';
    const exp = WgslGenerator.valueToCode(block, 'EXP', WgslGenerator.ORDER_NONE) || '1.0';
    return [`pow(${base}, ${exp})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_sqrt'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`sqrt(${value})`, WgslGenerator.ORDER_ATOMIC];
};

// Basic Math
WgslGenerator.forBlock['math_abs'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`abs(${value})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_min_max'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '0.0';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '0.0';
    return [`${func}(${a}, ${b})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_clamp'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    const min = WgslGenerator.valueToCode(block, 'MIN', WgslGenerator.ORDER_NONE) || '0.0';
    const max = WgslGenerator.valueToCode(block, 'MAX', WgslGenerator.ORDER_NONE) || '1.0';
    return [`clamp(${value}, ${min}, ${max})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_round'] = function(block) {
    const func = block.getFieldValue('FUNC');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`${func}(${value})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_sign'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    return [`sign(${value})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_lerp'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '0.0';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '0.0';
    const t = WgslGenerator.valueToCode(block, 'T', WgslGenerator.ORDER_NONE) || '0.0';
    return [`mix(${a}, ${b}, ${t})`, WgslGenerator.ORDER_ATOMIC];
};

// Physics-Specific
WgslGenerator.forBlock['physics_spring_force'] = function(block) {
    const stiffness = WgslGenerator.valueToCode(block, 'STIFFNESS', WgslGenerator.ORDER_NONE) || '1.0';
    const distance = WgslGenerator.valueToCode(block, 'DISTANCE', WgslGenerator.ORDER_NONE) || '0.0';
    const restLength = WgslGenerator.valueToCode(block, 'REST_LENGTH', WgslGenerator.ORDER_NONE) || '1.0';
    return [`${stiffness} * (${distance} - ${restLength})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['physics_damping_force'] = function(block) {
    const damping = WgslGenerator.valueToCode(block, 'DAMPING', WgslGenerator.ORDER_NONE) || '1.0';
    const velocity = WgslGenerator.valueToCode(block, 'VELOCITY', WgslGenerator.ORDER_NONE) || 'vec3<f32>(0.0)';
    const direction = WgslGenerator.valueToCode(block, 'DIRECTION', WgslGenerator.ORDER_NONE) || 'vec3<f32>(1.0, 0.0, 0.0)';
    return [`-${damping} * dot(${velocity}, ${direction})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['math_harmonic_mean'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '1.0';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '1.0';
    return [`(${a} * ${b}) / (${a} + ${b})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['physics_moment_inertia'] = function(block) {
    const mass = WgslGenerator.valueToCode(block, 'MASS', WgslGenerator.ORDER_NONE) || '1.0';
    const radius = WgslGenerator.valueToCode(block, 'RADIUS', WgslGenerator.ORDER_NONE) || '1.0';
    return [`(2.0 / 5.0) * ${mass} * ${radius} * ${radius}`, WgslGenerator.ORDER_ATOMIC];
};

// Constants
WgslGenerator.forBlock['math_constant'] = function(block) {
    const constant = block.getFieldValue('CONSTANT');
    const constants = {
        'PI': '3.14159265359',
        'TAU': '6.28318530718',
        'E': '2.71828182846',
        'PHI': '1.618033988749895',
        'SQRT2': '1.41421356237',
        'EPSILON': '1e-6'
    };
    return [constants[constant], WgslGenerator.ORDER_ATOMIC];
};

// Angle Conversion
WgslGenerator.forBlock['angle_convert'] = function(block) {
    const angle = WgslGenerator.valueToCode(block, 'ANGLE', WgslGenerator.ORDER_NONE) || '0.0';
    const from = block.getFieldValue('FROM');
    const to = block.getFieldValue('TO');
    
    if (from === to) {
        return [angle, WgslGenerator.ORDER_ATOMIC];
    } else if (from === 'deg' && to === 'rad') {
        return [`${angle} * 0.0174532925`, WgslGenerator.ORDER_ATOMIC]; // * PI/180
    } else {
        return [`${angle} * 57.2957795131`, WgslGenerator.ORDER_ATOMIC]; // * 180/PI
    }
};

// Comparison with Epsilon
WgslGenerator.forBlock['math_compare_epsilon'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '0.0';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '0.0';
    const epsilon = WgslGenerator.valueToCode(block, 'EPSILON', WgslGenerator.ORDER_NONE) || '1e-6';
    return [`abs(${a} - ${b}) < ${epsilon}`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// GENERATOR COMPLETENESS CHECK
// ============================================================================

/**
 * Check if all blocks have generators
 * This function can be called to validate generator completeness
 */
function checkWgslGeneratorCompleteness() {
    const missingGenerators = [];
    
    // Get all registered WGSL blocks
    const allBlocks = Object.keys(Blockly.Blocks).filter(type => type.startsWith('wgsl_'));
    
    // Check each block has a generator
    allBlocks.forEach(blockType => {
        if (!WgslGenerator.forBlock[blockType]) {
            missingGenerators.push(blockType);
        }
    });
    
    if (missingGenerators.length > 0) {
        console.error('Missing WGSL generators for blocks:', missingGenerators);
        return false;
    }
    
    console.log('All WGSL blocks have generators');
    return true;
}

// ============================================================================
// CROSS-MODE REFERENCE BLOCKS
// ============================================================================

WgslGenerator.forBlock['wgsl_reference_node'] = function(block) {
    const targetFile = block.getFieldValue('TARGET_FILE');
    const targetSymbol = block.getFieldValue('TARGET_SYMBOL');
    const description = block.getFieldValue('DESCRIPTION');
    
    // WGSL shaders typically reference Rust/Bevy code for bindings
    // Generate a comment indicating the reference
    let code = `// Reference to ${targetFile}`;
    
    if (targetSymbol) {
        code += `: ${targetSymbol}`;
    }
    
    if (description) {
        code += ` - ${description}`;
    }
    
    code += '\n';
    
    return code;
};

// ============================================================================
// ADDITIONAL VARIABLE TYPES GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_const'] = function(block) {
    const name = block.getFieldValue('NAME');
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0';
    
    return `const ${name} = ${value};\n`;
};

WgslGenerator.forBlock['wgsl_override'] = function(block) {
    const id = block.getFieldValue('ID');
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    const defaultValue = WgslGenerator.valueToCode(block, 'DEFAULT', WgslGenerator.ORDER_NONE) || '0';
    
    return `@id(${id}) override ${name}: ${type} = ${defaultValue};\n`;
};

WgslGenerator.forBlock['wgsl_workgroup_var'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `var<workgroup> ${name}: ${type};\n`;
};

WgslGenerator.forBlock['wgsl_private_var'] = function(block) {
    const name = block.getFieldValue('NAME');
    const type = block.getFieldValue('TYPE');
    
    return `var<private> ${name}: ${type};\n`;
};

// ============================================================================
// SYNCHRONIZATION GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_workgroup_barrier'] = function(block) {
    return `workgroupBarrier();\n`;
};

WgslGenerator.forBlock['wgsl_storage_barrier'] = function(block) {
    return `storageBarrier();\n`;
};

// ============================================================================
// VECTOR SWIZZLING GENERATOR
// ============================================================================

WgslGenerator.forBlock['wgsl_swizzle'] = function(block) {
    const vector = WgslGenerator.valueToCode(block, 'VECTOR', WgslGenerator.ORDER_NONE) || 'vec';
    const components = block.getFieldValue('COMPONENTS');
    
    return [`${vector}.${components}`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// POINTER & ADDRESS OPERATIONS GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_address_of'] = function(block) {
    const expr = WgslGenerator.valueToCode(block, 'EXPR', WgslGenerator.ORDER_NONE) || 'var';
    
    return [`&${expr}`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_dereference'] = function(block) {
    const ptr = WgslGenerator.valueToCode(block, 'PTR', WgslGenerator.ORDER_NONE) || 'ptr';
    
    return [`*${ptr}`, WgslGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ADDITIONAL TEXTURE TYPES GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_texture_storage_2d'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    const format = block.getFieldValue('FORMAT');
    const access = block.getFieldValue('ACCESS');
    
    return `@group(${group}) @binding(${binding})
var ${name}: texture_storage_2d<${format}, ${access}>;

`;
};

WgslGenerator.forBlock['wgsl_texture_depth_2d'] = function(block) {
    const group = block.getFieldValue('GROUP');
    const binding = block.getFieldValue('BINDING');
    const name = block.getFieldValue('NAME');
    
    return `@group(${group}) @binding(${binding})
var ${name}: texture_depth_2d;

`;
};

// ============================================================================
// ADDITIONAL MATH FUNCTIONS GENERATORS
// ============================================================================

WgslGenerator.forBlock['wgsl_select'] = function(block) {
    const falseValue = WgslGenerator.valueToCode(block, 'FALSE_VALUE', WgslGenerator.ORDER_NONE) || '0';
    const trueValue = WgslGenerator.valueToCode(block, 'TRUE_VALUE', WgslGenerator.ORDER_NONE) || '1';
    const condition = WgslGenerator.valueToCode(block, 'CONDITION', WgslGenerator.ORDER_NONE) || 'false';
    
    return [`select(${falseValue}, ${trueValue}, ${condition})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_smoothstep'] = function(block) {
    const low = WgslGenerator.valueToCode(block, 'LOW', WgslGenerator.ORDER_NONE) || '0.0';
    const high = WgslGenerator.valueToCode(block, 'HIGH', WgslGenerator.ORDER_NONE) || '1.0';
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.5';
    
    return [`smoothstep(${low}, ${high}, ${x})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_step'] = function(block) {
    const edge = WgslGenerator.valueToCode(block, 'EDGE', WgslGenerator.ORDER_NONE) || '0.0';
    const x = WgslGenerator.valueToCode(block, 'X', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`step(${edge}, ${x})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_fma'] = function(block) {
    const a = WgslGenerator.valueToCode(block, 'A', WgslGenerator.ORDER_NONE) || '0.0';
    const b = WgslGenerator.valueToCode(block, 'B', WgslGenerator.ORDER_NONE) || '0.0';
    const c = WgslGenerator.valueToCode(block, 'C', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`fma(${a}, ${b}, ${c})`, WgslGenerator.ORDER_ATOMIC];
};

WgslGenerator.forBlock['wgsl_saturate'] = function(block) {
    const value = WgslGenerator.valueToCode(block, 'VALUE', WgslGenerator.ORDER_NONE) || '0.0';
    
    return [`saturate(${value})`, WgslGenerator.ORDER_ATOMIC];
};

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WgslGenerator, checkWgslGeneratorCompleteness, validateWgslSyntax };
}
