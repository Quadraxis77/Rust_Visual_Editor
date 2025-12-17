/**
 * Cross-Mode Type and Alignment Validator
 * 
 * Validates type compatibility and struct alignment between Rust/Bevy and WGSL.
 * Critical for GPU programming where misalignment causes silent failures.
 * 
 * WGSL Alignment Rules (std140/std430):
 * - Scalars (f32, i32, u32): 4 bytes, align 4
 * - vec2<T>: 8 bytes, align 8
 * - vec3<T>: 12 bytes, align 16 (!)
 * - vec4<T>: 16 bytes, align 16
 * - mat2x2<T>: 16 bytes, align 8
 * - mat3x3<T>: 48 bytes, align 16
 * - mat4x4<T>: 64 bytes, align 16
 * - Arrays: element alignment, stride rounded to align 16
 * - Structs: largest member alignment, size rounded to alignment
 * 
 * Requirements: 8.1, 8.2, 8.3, 10.3
 */

class CrossModeValidator {
    constructor() {
        // Type mapping between Rust/Bevy and WGSL
        this.typeMap = new Map([
            // Scalars
            ['f32', 'f32'],
            ['i32', 'i32'],
            ['u32', 'u32'],
            ['bool', 'bool'],
            
            // Vectors
            ['Vec2', 'vec2<f32>'],
            ['Vec3', 'vec3<f32>'],
            ['Vec4', 'vec4<f32>'],
            ['IVec2', 'vec2<i32>'],
            ['IVec3', 'vec3<i32>'],
            ['IVec4', 'vec4<i32>'],
            ['UVec2', 'vec2<u32>'],
            ['UVec3', 'vec3<u32>'],
            ['UVec4', 'vec4<u32>'],
            
            // Matrices
            ['Mat2', 'mat2x2<f32>'],
            ['Mat3', 'mat3x3<f32>'],
            ['Mat4', 'mat4x4<f32>'],
        ]);
        
        // Type sizes and alignments (in bytes)
        this.typeInfo = new Map([
            // WGSL types
            ['f32', { size: 4, align: 4 }],
            ['i32', { size: 4, align: 4 }],
            ['u32', { size: 4, align: 4 }],
            ['bool', { size: 4, align: 4 }], // bool is 4 bytes in WGSL
            
            ['vec2<f32>', { size: 8, align: 8 }],
            ['vec2<i32>', { size: 8, align: 8 }],
            ['vec2<u32>', { size: 8, align: 8 }],
            
            ['vec3<f32>', { size: 12, align: 16 }], // Note: align 16!
            ['vec3<i32>', { size: 12, align: 16 }],
            ['vec3<u32>', { size: 12, align: 16 }],
            
            ['vec4<f32>', { size: 16, align: 16 }],
            ['vec4<i32>', { size: 16, align: 16 }],
            ['vec4<u32>', { size: 16, align: 16 }],
            
            ['mat2x2<f32>', { size: 16, align: 8 }],
            ['mat3x3<f32>', { size: 48, align: 16 }],
            ['mat4x4<f32>', { size: 64, align: 16 }],
            
            // Rust types (for reference)
            ['Vec2', { size: 8, align: 4 }],
            ['Vec3', { size: 12, align: 4 }],
            ['Vec4', { size: 16, align: 4 }],
            ['Mat2', { size: 16, align: 4 }],
            ['Mat3', { size: 36, align: 4 }],
            ['Mat4', { size: 64, align: 4 }],
        ]);
        
        this.errors = [];
        this.warnings = [];
    }

    /**
     * Validate type compatibility between Rust and WGSL
     * @param {string} rustType - Rust type name
     * @param {string} wgslType - WGSL type name
     * @returns {Object} { compatible: boolean, reason: string }
     */
    validateTypeCompatibility(rustType, wgslType) {
        // Normalize types
        rustType = this.normalizeType(rustType);
        wgslType = this.normalizeType(wgslType);
        
        // Check if types are compatible
        const expectedWgslType = this.typeMap.get(rustType);
        
        if (!expectedWgslType) {
            return {
                compatible: false,
                reason: `Unknown Rust type: ${rustType}`
            };
        }
        
        if (expectedWgslType !== wgslType) {
            return {
                compatible: false,
                reason: `Type mismatch: Rust type '${rustType}' maps to WGSL '${expectedWgslType}', but got '${wgslType}'`
            };
        }
        
        return { compatible: true };
    }

    /**
     * Parse a struct definition from code
     * @param {string} code - Struct definition code
     * @param {string} language - 'rust' or 'wgsl'
     * @returns {Object} Parsed struct info
     */
    parseStruct(code, language) {
        const struct = {
            name: '',
            fields: [],
            language: language
        };
        
        if (language === 'rust') {
            return this.parseRustStruct(code);
        } else if (language === 'wgsl') {
            return this.parseWgslStruct(code);
        }
        
        return struct;
    }

    /**
     * Parse Rust struct definition
     * @private
     */
    parseRustStruct(code) {
        const struct = { name: '', fields: [], language: 'rust' };
        
        // Extract struct name
        const nameMatch = code.match(/struct\s+(\w+)/);
        if (nameMatch) {
            struct.name = nameMatch[1];
        }
        
        // Extract fields (pub name: Type)
        const fieldRegex = /(?:pub\s+)?(\w+)\s*:\s*([^,\n}]+)/g;
        let match;
        
        while ((match = fieldRegex.exec(code)) !== null) {
            const fieldName = match[1].trim();
            const fieldType = match[2].trim();
            
            struct.fields.push({
                name: fieldName,
                type: fieldType,
                rustType: fieldType
            });
        }
        
        return struct;
    }

    /**
     * Parse WGSL struct definition
     * @private
     */
    parseWgslStruct(code) {
        const struct = { name: '', fields: [], language: 'wgsl' };
        
        // Extract struct name
        const nameMatch = code.match(/struct\s+(\w+)/);
        if (nameMatch) {
            struct.name = nameMatch[1];
        }
        
        // Extract fields (name: type)
        const fieldRegex = /(\w+)\s*:\s*([^,\n}]+)/g;
        let match;
        
        while ((match = fieldRegex.exec(code)) !== null) {
            const fieldName = match[1].trim();
            let fieldType = match[2].trim();
            
            // Remove trailing comma
            fieldType = fieldType.replace(/,\s*$/, '');
            
            struct.fields.push({
                name: fieldName,
                type: fieldType,
                wgslType: fieldType
            });
        }
        
        return struct;
    }

    /**
     * Calculate struct layout with alignment
     * @param {Object} struct - Parsed struct
     * @returns {Object} Layout info with offsets and padding
     */
    calculateStructLayout(struct) {
        const layout = {
            fields: [],
            totalSize: 0,
            alignment: 0,
            paddingBytes: 0
        };
        
        let currentOffset = 0;
        let maxAlignment = 0;
        
        for (const field of struct.fields) {
            const typeInfo = this.getTypeInfo(field.type);
            
            if (!typeInfo) {
                layout.fields.push({
                    ...field,
                    offset: currentOffset,
                    size: 0,
                    align: 0,
                    padding: 0,
                    error: `Unknown type: ${field.type}`
                });
                continue;
            }
            
            // Calculate padding needed for alignment
            const padding = this.calculatePadding(currentOffset, typeInfo.align);
            currentOffset += padding;
            
            // Track field info
            layout.fields.push({
                ...field,
                offset: currentOffset,
                size: typeInfo.size,
                align: typeInfo.align,
                padding: padding
            });
            
            // Update offset and max alignment
            currentOffset += typeInfo.size;
            maxAlignment = Math.max(maxAlignment, typeInfo.align);
        }
        
        // Struct size must be rounded up to alignment
        const finalPadding = this.calculatePadding(currentOffset, maxAlignment);
        
        layout.totalSize = currentOffset + finalPadding;
        layout.alignment = maxAlignment;
        layout.paddingBytes = struct.fields.reduce((sum, f, i) => sum + (layout.fields[i].padding || 0), 0) + finalPadding;
        
        return layout;
    }

    /**
     * Validate struct alignment between Rust and WGSL
     * @param {Object} rustStruct - Parsed Rust struct
     * @param {Object} wgslStruct - Parsed WGSL struct
     * @returns {Object} Validation result with errors and suggestions
     */
    validateStructAlignment(rustStruct, wgslStruct) {
        const result = {
            valid: true,
            errors: [],
            warnings: [],
            suggestions: [],
            rustLayout: null,
            wgslLayout: null
        };
        
        // Calculate layouts
        result.rustLayout = this.calculateStructLayout(rustStruct);
        result.wgslLayout = this.calculateStructLayout(wgslStruct);
        
        // Check field count
        if (rustStruct.fields.length !== wgslStruct.fields.length) {
            result.valid = false;
            result.errors.push({
                type: 'field_count_mismatch',
                message: `Field count mismatch: Rust has ${rustStruct.fields.length} fields, WGSL has ${wgslStruct.fields.length} fields`
            });
        }
        
        // Check each field
        const minFields = Math.min(rustStruct.fields.length, wgslStruct.fields.length);
        
        for (let i = 0; i < minFields; i++) {
            const rustField = rustStruct.fields[i];
            const wgslField = wgslStruct.fields[i];
            const rustFieldLayout = result.rustLayout.fields[i];
            const wgslFieldLayout = result.wgslLayout.fields[i];
            
            // Check field names
            if (rustField.name !== wgslField.name) {
                result.warnings.push({
                    type: 'field_name_mismatch',
                    message: `Field ${i}: Name mismatch - Rust: '${rustField.name}', WGSL: '${wgslField.name}'`,
                    field: i
                });
            }
            
            // Check type compatibility
            const typeCheck = this.validateTypeCompatibility(rustField.type, wgslField.type);
            if (!typeCheck.compatible) {
                result.valid = false;
                result.errors.push({
                    type: 'type_mismatch',
                    message: `Field '${rustField.name}': ${typeCheck.reason}`,
                    field: i
                });
            }
            
            // Check alignment
            if (wgslFieldLayout.padding > 0) {
                result.warnings.push({
                    type: 'alignment_padding',
                    message: `Field '${wgslField.name}' requires ${wgslFieldLayout.padding} bytes of padding for GPU alignment`,
                    field: i,
                    padding: wgslFieldLayout.padding
                });
                
                // Suggest explicit padding in Rust
                if (wgslFieldLayout.padding === 4) {
                    result.suggestions.push(`Add padding before '${rustField.name}': _pad${i}: u32`);
                } else if (wgslFieldLayout.padding === 8) {
                    result.suggestions.push(`Add padding before '${rustField.name}': _pad${i}: [u32; 2]`);
                } else if (wgslFieldLayout.padding === 12) {
                    result.suggestions.push(`Add padding before '${rustField.name}': _pad${i}: [u32; 3]`);
                }
            }
        }
        
        // Check total size
        if (result.rustLayout.totalSize !== result.wgslLayout.totalSize) {
            result.valid = false;
            result.errors.push({
                type: 'size_mismatch',
                message: `Struct size mismatch: Rust ${result.rustLayout.totalSize} bytes, WGSL ${result.wgslLayout.totalSize} bytes`,
                rustSize: result.rustLayout.totalSize,
                wgslSize: result.wgslLayout.totalSize
            });
            
            result.suggestions.push(`Add #[repr(C, align(16))] to Rust struct to match GPU alignment`);
        }
        
        // Check for vec3 usage (common pitfall)
        for (let i = 0; i < wgslStruct.fields.length; i++) {
            const field = wgslStruct.fields[i];
            if (field.type.includes('vec3')) {
                result.warnings.push({
                    type: 'vec3_alignment',
                    message: `Field '${field.name}' uses vec3 which has 16-byte alignment but only 12 bytes size. Consider using vec4 or add explicit padding.`,
                    field: i
                });
                
                result.suggestions.push(`Consider changing '${field.name}: vec3<f32>' to 'vec4<f32>' or add padding field after it`);
            }
        }
        
        return result;
    }

    /**
     * Get type info (size and alignment)
     * @private
     */
    getTypeInfo(type) {
        type = this.normalizeType(type);
        return this.typeInfo.get(type);
    }

    /**
     * Calculate padding needed for alignment
     * @private
     */
    calculatePadding(offset, alignment) {
        const remainder = offset % alignment;
        return remainder === 0 ? 0 : alignment - remainder;
    }

    /**
     * Normalize type name (remove whitespace, etc.)
     * @private
     */
    normalizeType(type) {
        return type.trim().replace(/\s+/g, ' ');
    }

    /**
     * Format validation result as human-readable text
     * @param {Object} result - Validation result
     * @returns {string} Formatted text
     */
    formatValidationResult(result) {
        let output = '';
        
        if (result.valid) {
            output += '✓ Struct alignment is valid!\n\n';
        } else {
            output += '✗ Struct alignment validation failed!\n\n';
        }
        
        // Show errors
        if (result.errors.length > 0) {
            output += `Errors (${result.errors.length}):\n`;
            result.errors.forEach((error, i) => {
                output += `  ${i + 1}. ${error.message}\n`;
            });
            output += '\n';
        }
        
        // Show warnings
        if (result.warnings.length > 0) {
            output += `Warnings (${result.warnings.length}):\n`;
            result.warnings.forEach((warning, i) => {
                output += `  ${i + 1}. ${warning.message}\n`;
            });
            output += '\n';
        }
        
        // Show suggestions
        if (result.suggestions.length > 0) {
            output += `Suggestions:\n`;
            result.suggestions.forEach((suggestion, i) => {
                output += `  ${i + 1}. ${suggestion}\n`;
            });
            output += '\n';
        }
        
        // Show layout comparison
        if (result.rustLayout && result.wgslLayout) {
            output += 'Layout Comparison:\n';
            output += `  Rust:  ${result.rustLayout.totalSize} bytes (${result.rustLayout.paddingBytes} padding)\n`;
            output += `  WGSL:  ${result.wgslLayout.totalSize} bytes (${result.wgslLayout.paddingBytes} padding)\n`;
            output += '\n';
            
            output += 'Field Layout:\n';
            const maxFields = Math.max(
                result.rustLayout.fields.length,
                result.wgslLayout.fields.length
            );
            
            for (let i = 0; i < maxFields; i++) {
                const rustField = result.rustLayout.fields[i];
                const wgslField = result.wgslLayout.fields[i];
                
                if (rustField && wgslField) {
                    output += `  ${rustField.name}:\n`;
                    output += `    Rust:  offset ${rustField.offset}, size ${rustField.size}, align ${rustField.align}`;
                    if (rustField.padding > 0) output += `, padding ${rustField.padding}`;
                    output += '\n';
                    output += `    WGSL:  offset ${wgslField.offset}, size ${wgslField.size}, align ${wgslField.align}`;
                    if (wgslField.padding > 0) output += `, padding ${wgslField.padding}`;
                    output += '\n';
                }
            }
        }
        
        return output;
    }

    /**
     * Validate all structs in workspace
     * @param {Object} workspace - Blockly workspace
     * @returns {Array} Array of validation results
     */
    validateWorkspace(workspace) {
        const results = [];
        
        // Find all struct blocks
        const blocks = workspace.getAllBlocks(false);
        const rustStructs = new Map();
        const wgslStructs = new Map();
        
        // Collect structs by name
        blocks.forEach(block => {
            if (block.type === 'rust_struct') {
                const code = RustGenerator.blockToCode(block);
                const struct = this.parseRustStruct(code);
                if (struct.name) {
                    rustStructs.set(struct.name, struct);
                }
            } else if (block.type === 'wgsl_struct') {
                const code = WgslGenerator.blockToCode(block);
                const struct = this.parseWgslStruct(code);
                if (struct.name) {
                    wgslStructs.set(struct.name, struct);
                }
            }
        });
        
        // Find matching structs and validate
        rustStructs.forEach((rustStruct, name) => {
            const wgslStruct = wgslStructs.get(name);
            if (wgslStruct) {
                const result = this.validateStructAlignment(rustStruct, wgslStruct);
                result.structName = name;
                results.push(result);
            }
        });
        
        return results;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrossModeValidator;
}
