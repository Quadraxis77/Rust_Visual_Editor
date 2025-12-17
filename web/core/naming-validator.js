// Naming Convention Validator
// Enforces the {mode}_{category}_{action} naming pattern for all blocks
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5

class NamingValidator {
    constructor() {
        // Valid mode prefixes
        this.validModes = ['rust', 'wgsl', 'bevy', 'bio'];
        
        // Naming pattern: {mode}_{category}_{action}
        // Examples: rust_vec3_new, wgsl_compute_shader, bevy_system, bio_cell_type
        this.namingPattern = /^(rust|wgsl|bevy|bio)_[a-z][a-z0-9]*(_[a-z][a-z0-9]*)*$/;
        
        // Cache for validation results
        this.validationCache = new Map();
        
        // Track all registered block types by mode
        this.blocksByMode = {
            rust: new Set(),
            wgsl: new Set(),
            bevy: new Set(),
            bio: new Set()
        };
    }

    /**
     * Validate a block type name against the naming convention
     * @param {string} blockType - The block type to validate
     * @returns {Object} Validation result with { valid: boolean, error: string, mode: string }
     */
    validateBlockName(blockType) {
        // Check cache first
        if (this.validationCache.has(blockType)) {
            return this.validationCache.get(blockType);
        }

        const result = this._performValidation(blockType);
        this.validationCache.set(blockType, result);
        return result;
    }

    /**
     * Internal validation logic
     * @private
     */
    _performValidation(blockType) {
        if (!blockType || typeof blockType !== 'string') {
            return {
                valid: false,
                error: 'Block type must be a non-empty string',
                mode: null
            };
        }

        // Check if it matches the pattern
        if (!this.namingPattern.test(blockType)) {
            // Extract what mode prefix it has (if any)
            const parts = blockType.split('_');
            const prefix = parts[0];
            
            if (!this.validModes.includes(prefix)) {
                return {
                    valid: false,
                    error: `Block type "${blockType}" must start with a valid mode prefix: ${this.validModes.join(', ')}`,
                    mode: null,
                    suggestion: this._suggestCorrection(blockType)
                };
            }

            return {
                valid: false,
                error: `Block type "${blockType}" does not follow the naming convention: {mode}_{category}_{action}. Use lowercase with underscores.`,
                mode: prefix,
                suggestion: this._suggestCorrection(blockType)
            };
        }

        // Extract mode from valid name
        const mode = blockType.split('_')[0];

        return {
            valid: true,
            error: null,
            mode: mode
        };
    }

    /**
     * Suggest a corrected name based on common mistakes
     * @private
     */
    _suggestCorrection(blockType) {
        // Convert to lowercase
        let suggestion = blockType.toLowerCase();
        
        // Replace invalid characters with underscores
        suggestion = suggestion.replace(/[^a-z0-9_]/g, '_');
        
        // Remove multiple consecutive underscores
        suggestion = suggestion.replace(/_+/g, '_');
        
        // Remove leading/trailing underscores
        suggestion = suggestion.replace(/^_+|_+$/g, '');
        
        // If it doesn't start with a valid mode, try to infer
        const parts = suggestion.split('_');
        if (!this.validModes.includes(parts[0])) {
            // Try to infer mode from context
            if (suggestion.includes('shader') || suggestion.includes('compute') || suggestion.includes('vertex') || suggestion.includes('fragment')) {
                suggestion = 'wgsl_' + suggestion;
            } else if (suggestion.includes('system') || suggestion.includes('query') || suggestion.includes('entity') || suggestion.includes('component')) {
                suggestion = 'bevy_' + suggestion;
            } else if (suggestion.includes('cell') || suggestion.includes('genome') || suggestion.includes('adhesion') || suggestion.includes('bio')) {
                suggestion = 'bio_' + suggestion;
            } else {
                suggestion = 'rust_' + suggestion;
            }
        }
        
        return suggestion;
    }

    /**
     * Register a block type and track it by mode
     * @param {string} blockType - The block type to register
     * @returns {boolean} True if registration succeeded
     */
    registerBlock(blockType) {
        const validation = this.validateBlockName(blockType);
        
        if (!validation.valid) {
            console.warn(`[NamingValidator] Cannot register invalid block type: ${blockType}`, validation.error);
            return false;
        }

        this.blocksByMode[validation.mode].add(blockType);
        return true;
    }

    /**
     * Get all blocks for a specific mode
     * @param {string} mode - The mode to filter by
     * @returns {Array<string>} Array of block types for that mode
     */
    getBlocksByMode(mode) {
        if (!this.validModes.includes(mode)) {
            console.error(`[NamingValidator] Invalid mode: ${mode}`);
            return [];
        }
        return Array.from(this.blocksByMode[mode]);
    }

    /**
     * Filter blocks by mode prefix
     * @param {Array<string>} blockTypes - Array of block types to filter
     * @param {string} mode - The mode to filter by
     * @returns {Array<string>} Filtered array of block types
     */
    filterByMode(blockTypes, mode) {
        if (!this.validModes.includes(mode)) {
            console.error(`[NamingValidator] Invalid mode: ${mode}`);
            return [];
        }
        return blockTypes.filter(type => type.startsWith(mode + '_'));
    }

    /**
     * Extract mode from a block type
     * @param {string} blockType - The block type
     * @returns {string|null} The mode prefix or null if invalid
     */
    extractMode(blockType) {
        const validation = this.validateBlockName(blockType);
        return validation.mode;
    }

    /**
     * Validate all blocks in a workspace
     * @param {Blockly.Workspace} workspace - The Blockly workspace
     * @returns {Object} Validation report with errors and warnings
     */
    validateWorkspace(workspace) {
        const report = {
            valid: true,
            errors: [],
            warnings: [],
            blockCount: 0,
            invalidBlocks: []
        };

        const allBlocks = workspace.getAllBlocks(false);
        report.blockCount = allBlocks.length;

        allBlocks.forEach(block => {
            const blockType = block.type;
            const validation = this.validateBlockName(blockType);

            if (!validation.valid) {
                report.valid = false;
                report.errors.push({
                    blockId: block.id,
                    blockType: blockType,
                    error: validation.error,
                    suggestion: validation.suggestion
                });
                report.invalidBlocks.push(block);
            }
        });

        return report;
    }

    /**
     * Validate all block definitions loaded in Blockly
     * @returns {Object} Validation report
     */
    validateAllDefinitions() {
        const report = {
            valid: true,
            errors: [],
            warnings: [],
            totalBlocks: 0,
            validBlocks: 0,
            invalidBlocks: 0,
            blocksByMode: {
                rust: 0,
                wgsl: 0,
                bevy: 0,
                bio: 0
            }
        };

        // Get all registered block types from Blockly
        const allBlockTypes = Object.keys(Blockly.Blocks);
        report.totalBlocks = allBlockTypes.length;

        allBlockTypes.forEach(blockType => {
            const validation = this.validateBlockName(blockType);

            if (validation.valid) {
                report.validBlocks++;
                report.blocksByMode[validation.mode]++;
                this.registerBlock(blockType);
            } else {
                report.valid = false;
                report.invalidBlocks++;
                report.errors.push({
                    blockType: blockType,
                    error: validation.error,
                    suggestion: validation.suggestion
                });
            }
        });

        return report;
    }

    /**
     * Generate documentation grouped by mode prefix
     * @returns {Object} Documentation structure organized by mode
     */
    generateDocumentation() {
        const docs = {
            rust: [],
            wgsl: [],
            bevy: [],
            bio: []
        };

        Object.keys(Blockly.Blocks).forEach(blockType => {
            const validation = this.validateBlockName(blockType);
            if (validation.valid) {
                const block = Blockly.Blocks[blockType];
                docs[validation.mode].push({
                    type: blockType,
                    tooltip: block.tooltip || 'No description',
                    mode: validation.mode
                });
            }
        });

        return docs;
    }

    /**
     * Search blocks by mode prefix
     * @param {string} searchTerm - The search term
     * @param {string} mode - Optional mode filter
     * @returns {Array<string>} Matching block types
     */
    searchBlocks(searchTerm, mode = null) {
        const allBlockTypes = Object.keys(Blockly.Blocks);
        let results = allBlockTypes.filter(type => 
            type.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (mode && this.validModes.includes(mode)) {
            results = this.filterByMode(results, mode);
        }

        return results;
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
    }

    /**
     * Get validation statistics
     * @returns {Object} Statistics about validated blocks
     */
    getStatistics() {
        return {
            totalValidated: this.validationCache.size,
            blocksByMode: {
                rust: this.blocksByMode.rust.size,
                wgsl: this.blocksByMode.wgsl.size,
                bevy: this.blocksByMode.bevy.size,
                bio: this.blocksByMode.bio.size
            },
            totalRegistered: Object.values(this.blocksByMode).reduce((sum, set) => sum + set.size, 0)
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NamingValidator;
}
