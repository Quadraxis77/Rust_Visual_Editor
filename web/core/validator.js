/**
 * Validator Module for Blockly Code Generation
 * 
 * Provides validation for block connections, type checking with cross-mode compatibility,
 * block validation, and code syntax validation.
 * 
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

// Cross-mode type compatibility matrix
// Defines which types can be used across different modes
const CROSS_MODE_TYPES = {
  // Numeric types - compatible across all modes
  'Number': {
    rust: ['f32', 'f64', 'i32', 'i64', 'u32', 'u64'],
    wgsl: ['f32', 'i32', 'u32'],
    bevy: ['f32', 'f64', 'i32', 'i64', 'u32', 'u64'],
    biospheres: ['f32', 'f64']
  },
  
  // Vector types - compatible across Rust, WGSL, Bevy
  'Vec2': {
    rust: ['Vec2', 'glam::Vec2'],
    wgsl: ['vec2<f32>'],
    bevy: ['Vec2'],
    biospheres: ['Vec2']
  },
  
  'Vec3': {
    rust: ['Vec3', 'glam::Vec3'],
    wgsl: ['vec3<f32>'],
    bevy: ['Vec3'],
    biospheres: ['Vec3']
  },
  
  'Vec4': {
    rust: ['Vec4', 'glam::Vec4'],
    wgsl: ['vec4<f32>'],
    bevy: ['Vec4'],
    biospheres: ['Vec4']
  },
  
  // Boolean type
  'Boolean': {
    rust: ['bool'],
    wgsl: ['bool'],
    bevy: ['bool'],
    biospheres: ['bool']
  },
  
  // String type (not available in WGSL)
  'String': {
    rust: ['String', '&str'],
    wgsl: [],
    bevy: ['String', '&str'],
    biospheres: ['String', '&str']
  },
  
  // Entity type (Bevy-specific but can be referenced)
  'Entity': {
    rust: [],
    wgsl: [],
    bevy: ['Entity'],
    biospheres: ['Entity']
  },
  
  // Color type
  'Color': {
    rust: [],
    wgsl: ['vec4<f32>'],
    bevy: ['Color'],
    biospheres: ['Color']
  }
};

// Type hierarchy for inheritance checking
const TYPE_HIERARCHY = {
  'Number': ['f32', 'f64', 'i32', 'i64', 'u32', 'u64'],
  'Vector': ['Vec2', 'Vec3', 'Vec4'],
  'Any': ['Number', 'Vector', 'Boolean', 'String', 'Entity', 'Color']
};

class Validator {
  constructor(errorHandler = null) {
    this.errors = [];
    this.warnings = [];
    this.errorHandler = errorHandler;
  }

  /**
   * Set the error handler for displaying validation errors
   * @param {Object} errorHandler - The error handler instance
   */
  setErrorHandler(errorHandler) {
    this.errorHandler = errorHandler;
  }

  /**
   * Validates if an output type can connect to an input type
   * @param {string} outputType - The type of the output connection
   * @param {string} inputType - The type of the input connection
   * @param {string} sourceMode - The mode of the source block (optional)
   * @param {string} targetMode - The mode of the target block (optional)
   * @param {Object} connection - The connection object for showing tooltips (optional)
   * @returns {boolean|Object} - True if connection is valid, or object with error details
   */
  validateConnection(outputType, inputType, sourceMode = null, targetMode = null, connection = null) {
    // Null or undefined types are invalid
    if (!outputType || !inputType) {
      const reason = 'Connection types are not defined';
      if (connection && this.errorHandler) {
        this.errorHandler.showConnectionTooltip(connection, reason);
      }
      return false;
    }

    // Exact match
    if (outputType === inputType) {
      return true;
    }

    // 'Any' type accepts everything
    if (inputType === 'Any') {
      return true;
    }

    // Check type hierarchy
    if (this.isTypeCompatible(outputType, inputType)) {
      return true;
    }

    // Cross-mode compatibility check
    if (sourceMode && targetMode && sourceMode !== targetMode) {
      const isCompatible = this.isCrossModeCompatible(sourceMode, targetMode, outputType, inputType);
      
      if (!isCompatible && connection && this.errorHandler) {
        const reason = `Type mismatch: Cannot connect ${outputType} (${sourceMode}) to ${inputType} (${targetMode})`;
        this.errorHandler.showConnectionTooltip(connection, reason);
      }
      
      return isCompatible;
    }

    // Connection is invalid
    if (connection && this.errorHandler) {
      const reason = `Type mismatch: Cannot connect ${outputType} to ${inputType}`;
      this.errorHandler.showConnectionTooltip(connection, reason);
    }

    return false;
  }

  /**
   * Checks if two types are compatible within the same mode
   * @param {string} outputType - The output type
   * @param {string} inputType - The input type
   * @returns {boolean} - True if types are compatible
   */
  isTypeCompatible(outputType, inputType) {
    // Check if inputType is a parent type of outputType
    for (const [parentType, childTypes] of Object.entries(TYPE_HIERARCHY)) {
      if (inputType === parentType && childTypes.includes(outputType)) {
        return true;
      }
    }

    // Check if both types belong to the same parent category
    for (const childTypes of Object.values(TYPE_HIERARCHY)) {
      if (childTypes.includes(outputType) && childTypes.includes(inputType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Validates a block's configuration and connections
   * @param {Object} block - The Blockly block to validate
   * @returns {Object} - Validation result with errors and warnings
   */
  validateBlock(block) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!block) {
      result.valid = false;
      result.errors.push('Block is null or undefined');
      return result;
    }

    // Check if block has required fields
    if (!block.type) {
      result.valid = false;
      result.errors.push('Block missing type field');
    }

    // Validate block mode if present
    if (block.mode && !['rust', 'wgsl', 'bevy', 'biospheres'].includes(block.mode)) {
      result.valid = false;
      result.errors.push(`Invalid mode: ${block.mode}`);
    }

    // Validate input connections
    if (block.inputList) {
      for (const input of block.inputList) {
        if (input.connection && input.connection.targetConnection) {
          const targetBlock = input.connection.targetBlock();
          if (targetBlock) {
            const outputType = targetBlock.outputConnection?.check_?.[0];
            const inputType = input.connection.check_?.[0];
            
            if (outputType && inputType) {
              const sourceMode = targetBlock.mode;
              const targetMode = block.mode;
              
              if (!this.validateConnection(outputType, inputType, sourceMode, targetMode)) {
                result.valid = false;
                result.errors.push(
                  `Type mismatch: Cannot connect ${outputType} to ${inputType}`
                );
              }
            }
          }
        }
      }
    }

    // Check for required fields
    if (block.inputList) {
      for (const input of block.inputList) {
        if (input.type === Blockly.INPUT_VALUE && !input.connection?.targetConnection) {
          result.warnings.push(`Input '${input.name}' is not connected`);
        }
      }
    }

    return result;
  }

  /**
   * Validates generated code syntax for a specific language
   * @param {string} code - The generated code to validate
   * @param {string} language - The target language (rust, wgsl, etc.)
   * @returns {Object} - Validation result with syntax errors
   */
  validateCode(code, language) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!code || code.trim() === '') {
      result.warnings.push('Generated code is empty');
      return result;
    }

    // Basic syntax validation based on language
    switch (language) {
      case 'rust':
        this.validateRustSyntax(code, result);
        break;
      case 'wgsl':
        this.validateWGSLSyntax(code, result);
        break;
      case 'bevy':
        // Bevy uses Rust syntax
        this.validateRustSyntax(code, result);
        break;
      case 'biospheres':
        // Biospheres uses Rust syntax
        this.validateRustSyntax(code, result);
        break;
      default:
        result.warnings.push(`Unknown language: ${language}`);
    }

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validates Rust syntax (basic checks)
   * @param {string} code - The Rust code
   * @param {Object} result - The result object to populate
   */
  validateRustSyntax(code, result) {
    // Check for balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      result.errors.push('Unbalanced braces in Rust code');
    }

    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      result.errors.push('Unbalanced parentheses in Rust code');
    }

    // Check for balanced brackets
    const openBrackets = (code.match(/\[/g) || []).length;
    const closeBrackets = (code.match(/\]/g) || []).length;
    if (openBrackets !== closeBrackets) {
      result.errors.push('Unbalanced brackets in Rust code');
    }

    // Check for common syntax errors
    if (code.includes(';;')) {
      result.warnings.push('Double semicolon detected');
    }

    // Check for unterminated strings
    const singleQuotes = (code.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (code.match(/(?<!\\)"/g) || []).length;
    if (singleQuotes % 2 !== 0) {
      result.errors.push('Unterminated single-quoted string');
    }
    if (doubleQuotes % 2 !== 0) {
      result.errors.push('Unterminated double-quoted string');
    }
  }

  /**
   * Validates WGSL syntax (basic checks)
   * @param {string} code - The WGSL code
   * @param {Object} result - The result object to populate
   */
  validateWGSLSyntax(code, result) {
    // Check for balanced braces
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      result.errors.push('Unbalanced braces in WGSL code');
    }

    // Check for balanced parentheses
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      result.errors.push('Unbalanced parentheses in WGSL code');
    }

    // Check for required shader entry points
    if (!code.includes('@vertex') && !code.includes('@fragment') && !code.includes('@compute')) {
      result.warnings.push('No shader entry point found (@vertex, @fragment, or @compute)');
    }

    // Check for semicolons (WGSL requires them)
    const lines = code.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*');
    });
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.endsWith(';') && !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') && !trimmed.startsWith('@')) {
        result.warnings.push(`Line may be missing semicolon: ${trimmed.substring(0, 50)}`);
        break; // Only report first occurrence
      }
    }
  }

  /**
   * Gets type compatibility information between two modes
   * @param {string} type1 - First type
   * @param {string} type2 - Second type
   * @returns {Object} - Compatibility information
   */
  getTypeCompatibility(type1, type2) {
    // Check if types are in the cross-mode compatibility matrix
    for (const [genericType, modeTypes] of Object.entries(CROSS_MODE_TYPES)) {
      const modes1 = [];
      const modes2 = [];
      
      for (const [mode, types] of Object.entries(modeTypes)) {
        if (types.includes(type1)) modes1.push(mode);
        if (types.includes(type2)) modes2.push(mode);
      }
      
      if (modes1.length > 0 && modes2.length > 0) {
        return {
          compatible: true,
          genericType: genericType,
          modes1: modes1,
          modes2: modes2
        };
      }
    }
    
    return {
      compatible: false,
      genericType: null,
      modes1: [],
      modes2: []
    };
  }

  /**
   * Checks if a type is compatible across different modes
   * @param {string} sourceMode - The source mode
   * @param {string} targetMode - The target mode
   * @param {string} outputType - The output type from source
   * @param {string} inputType - The input type in target
   * @returns {boolean} - True if cross-mode compatible
   */
  isCrossModeCompatible(sourceMode, targetMode, outputType, inputType) {
    // Same mode - use regular validation
    if (sourceMode === targetMode) {
      return this.validateConnection(outputType, inputType);
    }

    // Check cross-mode compatibility matrix
    for (const [genericType, modeTypes] of Object.entries(CROSS_MODE_TYPES)) {
      const sourceTypes = modeTypes[sourceMode] || [];
      const targetTypes = modeTypes[targetMode] || [];
      
      if (sourceTypes.includes(outputType) && targetTypes.includes(inputType)) {
        return true;
      }
      
      // Also check if they map to the same generic type
      if (sourceTypes.includes(outputType) && inputType === genericType) {
        return true;
      }
      if (outputType === genericType && targetTypes.includes(inputType)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Clears all stored errors and warnings
   */
  clearErrors() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Gets all validation errors
   * @returns {Array} - Array of error messages
   */
  getErrors() {
    return [...this.errors];
  }

  /**
   * Gets all validation warnings
   * @returns {Array} - Array of warning messages
   */
  getWarnings() {
    return [...this.warnings];
  }

  /**
   * Validate a field value and show error if invalid
   * @param {Object} block - The Blockly block
   * @param {string} fieldName - The field name
   * @param {*} value - The field value
   * @param {Object} constraints - Validation constraints
   * @returns {boolean} - True if valid
   */
  validateField(block, fieldName, value, constraints = {}) {
    if (!block || !fieldName) return true;

    const errors = [];

    // Check if field is required
    if (constraints.required && (value === null || value === undefined || value === '')) {
      errors.push(`Field "${fieldName}" is required`);
    }

    // Check min/max for numeric values
    if (typeof value === 'number') {
      if (constraints.min !== undefined && value < constraints.min) {
        errors.push(`Value must be at least ${constraints.min}`);
      }
      if (constraints.max !== undefined && value > constraints.max) {
        errors.push(`Value must be at most ${constraints.max}`);
      }
    }

    // Check string length
    if (typeof value === 'string') {
      if (constraints.minLength !== undefined && value.length < constraints.minLength) {
        errors.push(`Must be at least ${constraints.minLength} characters`);
      }
      if (constraints.maxLength !== undefined && value.length > constraints.maxLength) {
        errors.push(`Must be at most ${constraints.maxLength} characters`);
      }
      if (constraints.pattern && !constraints.pattern.test(value)) {
        errors.push(`Invalid format`);
      }
    }

    // Check custom validator
    if (constraints.validator && typeof constraints.validator === 'function') {
      const customError = constraints.validator(value);
      if (customError) {
        errors.push(customError);
      }
    }

    // Show errors if any
    if (errors.length > 0 && this.errorHandler) {
      const errorMessage = errors.join('; ');
      this.errorHandler.showError(errorMessage, {
        blockId: block.id,
        blockType: block.type,
        field: fieldName,
        type: 'field_validation',
        suggestion: `Fix the "${fieldName}" field: ${errorMessage}`
      });
      return false;
    }

    // Clear any existing field errors
    if (this.errorHandler) {
      this.errorHandler.clearFieldError(block.id, fieldName);
    }

    return true;
  }

  /**
   * Validate all fields in a block
   * @param {Object} block - The Blockly block
   * @returns {Object} - Validation result
   */
  validateBlockFields(block) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    if (!block) {
      result.valid = false;
      result.errors.push('Block is null or undefined');
      return result;
    }

    // Get block definition to check for validation rules
    const blockDef = Blockly.Blocks[block.type];
    if (!blockDef) {
      return result; // No definition, can't validate
    }

    // Check validation rules if defined
    if (blockDef.validation) {
      for (const [fieldName, constraints] of Object.entries(blockDef.validation)) {
        const field = block.getField(fieldName);
        if (field) {
          const value = field.getValue();
          const isValid = this.validateField(block, fieldName, value, constraints);
          
          if (!isValid) {
            result.valid = false;
            result.errors.push(`Field "${fieldName}" validation failed`);
          }
        }
      }
    }

    return result;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Validator;
}
