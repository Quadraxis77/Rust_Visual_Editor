/**
 * Template Engine for Blockly Code Generation
 * 
 * Provides template-based code generation with placeholder replacement,
 * custom helper functions, and template validation.
 * 
 * Template syntax uses double curly braces: {{PLACEHOLDER}}
 * Example: "Vec3::new({{X}}, {{Y}}, {{Z}})"
 */
class TemplateEngine {
    constructor() {
        // Store custom helper functions
        this.helpers = new Map();
        
        // Register built-in helpers
        this._registerBuiltInHelpers();
    }

    /**
     * Process a template string by replacing placeholders with values from context
     * 
     * @param {string} template - Template string with {{PLACEHOLDER}} syntax
     * @param {object} context - Object containing values for placeholders
     * @returns {string} Processed template with placeholders replaced
     * 
     * @example
     * process("Vec3::new({{X}}, {{Y}}, {{Z}})", { X: 1.0, Y: 2.0, Z: 3.0 })
     * // Returns: "Vec3::new(1.0, 2.0, 3.0)"
     */
    process(template, context) {
        if (typeof template !== 'string') {
            throw new Error('Template must be a string');
        }
        
        if (!context || typeof context !== 'object') {
            throw new Error('Context must be an object');
        }

        // Replace all placeholders in the template
        let result = template;
        
        // Match {{PLACEHOLDER}} or {{helper:PLACEHOLDER}} patterns
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        
        result = result.replace(placeholderRegex, (match, placeholder) => {
            placeholder = placeholder.trim();
            
            // Check if this is a helper function call (format: helper:arg)
            if (placeholder.includes(':')) {
                const [helperName, arg] = placeholder.split(':').map(s => s.trim());
                
                if (this.helpers.has(helperName)) {
                    const helperFn = this.helpers.get(helperName);
                    const value = context[arg];
                    
                    if (value === undefined) {
                        console.warn(`Template placeholder '${arg}' not found in context`);
                        return match; // Return original placeholder if value not found
                    }
                    
                    return helperFn(value);
                }
                
                console.warn(`Helper function '${helperName}' not registered`);
                return match;
            }
            
            // Simple placeholder replacement
            if (placeholder in context) {
                const value = context[placeholder];
                
                // Handle different value types
                if (value === null || value === undefined) {
                    console.warn(`Template placeholder '${placeholder}' is null or undefined`);
                    return match;
                }
                
                return String(value);
            }
            
            // Placeholder not found in context
            console.warn(`Template placeholder '${placeholder}' not found in context`);
            return match; // Return original placeholder if not found
        });
        
        return result;
    }

    /**
     * Register a custom helper function for template processing
     * 
     * @param {string} name - Name of the helper function
     * @param {Function} fn - Function to process values
     * 
     * @example
     * registerHelper('upper', (value) => value.toUpperCase())
     * process("{{upper:name}}", { name: "rust" }) // Returns: "RUST"
     */
    registerHelper(name, fn) {
        if (typeof name !== 'string' || name.trim() === '') {
            throw new Error('Helper name must be a non-empty string');
        }
        
        if (typeof fn !== 'function') {
            throw new Error('Helper must be a function');
        }
        
        this.helpers.set(name, fn);
    }

    /**
     * Validate template syntax
     * 
     * @param {string} template - Template string to validate
     * @returns {boolean} True if template is valid, false otherwise
     * 
     * Checks for:
     * - Balanced curly braces
     * - Valid placeholder syntax
     * - No empty placeholders
     */
    validateTemplate(template) {
        if (typeof template !== 'string') {
            return false;
        }

        // Check for balanced curly braces
        let braceCount = 0;
        let inPlaceholder = false;
        
        for (let i = 0; i < template.length; i++) {
            if (template[i] === '{') {
                if (i + 1 < template.length && template[i + 1] === '{') {
                    if (inPlaceholder) {
                        // Nested {{ not allowed
                        return false;
                    }
                    inPlaceholder = true;
                    braceCount++;
                    i++; // Skip next brace
                }
            } else if (template[i] === '}') {
                if (i + 1 < template.length && template[i + 1] === '}') {
                    if (!inPlaceholder) {
                        // Closing }} without opening {{
                        return false;
                    }
                    inPlaceholder = false;
                    braceCount--;
                    i++; // Skip next brace
                }
            }
        }
        
        // All braces should be balanced
        if (braceCount !== 0 || inPlaceholder) {
            return false;
        }

        // Check for empty placeholders
        const emptyPlaceholderRegex = /\{\{\s*\}\}/;
        if (emptyPlaceholderRegex.test(template)) {
            return false;
        }

        // Check for valid placeholder names (alphanumeric, underscore, colon for helpers)
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        let match;
        
        while ((match = placeholderRegex.exec(template)) !== null) {
            const placeholder = match[1].trim();
            
            // Check if it's a helper call
            if (placeholder.includes(':')) {
                const parts = placeholder.split(':');
                if (parts.length !== 2) {
                    return false; // Only one colon allowed
                }
                
                const [helperName, arg] = parts.map(s => s.trim());
                
                // Validate helper name and argument
                if (!this._isValidIdentifier(helperName) || !this._isValidIdentifier(arg)) {
                    return false;
                }
            } else {
                // Simple placeholder - must be valid identifier
                if (!this._isValidIdentifier(placeholder)) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Extract all placeholder names from a template
     * 
     * @param {string} template - Template string
     * @returns {string[]} Array of placeholder names (without {{ }})
     * 
     * @example
     * getPlaceholders("Vec3::new({{X}}, {{Y}}, {{Z}})")
     * // Returns: ["X", "Y", "Z"]
     */
    getPlaceholders(template) {
        if (typeof template !== 'string') {
            return [];
        }

        const placeholders = [];
        const placeholderRegex = /\{\{([^}]+)\}\}/g;
        let match;
        
        while ((match = placeholderRegex.exec(template)) !== null) {
            let placeholder = match[1].trim();
            
            // If it's a helper call, extract just the argument name
            if (placeholder.includes(':')) {
                const parts = placeholder.split(':');
                if (parts.length === 2) {
                    placeholder = parts[1].trim();
                }
            }
            
            // Add to list if not already present
            if (!placeholders.includes(placeholder)) {
                placeholders.push(placeholder);
            }
        }
        
        return placeholders;
    }

    /**
     * Register built-in helper functions
     * @private
     */
    _registerBuiltInHelpers() {
        // String transformation helpers
        this.registerHelper('upper', (value) => String(value).toUpperCase());
        this.registerHelper('lower', (value) => String(value).toLowerCase());
        this.registerHelper('capitalize', (value) => {
            const str = String(value);
            return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        });
        
        // Type conversion helpers
        this.registerHelper('string', (value) => String(value));
        this.registerHelper('number', (value) => Number(value));
        this.registerHelper('bool', (value) => Boolean(value));
        
        // Code formatting helpers
        this.registerHelper('quote', (value) => `"${value}"`);
        this.registerHelper('escape', (value) => {
            return String(value)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
        });
        
        // Default value helper
        this.registerHelper('default', (value) => {
            return value !== null && value !== undefined ? value : '0';
        });
    }

    /**
     * Check if a string is a valid identifier (alphanumeric + underscore)
     * @private
     */
    _isValidIdentifier(str) {
        if (!str || typeof str !== 'string') {
            return false;
        }
        
        // Must start with letter or underscore, followed by letters, numbers, or underscores
        const identifierRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
        return identifierRegex.test(str);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateEngine;
}
