/**
 * Performance Cache Module
 * 
 * Provides caching for code generation, validation results, and toolbox structures
 * to improve performance and reduce redundant computations.
 * 
 * Requirements: 5.1, 5.2, 5.3, 9.5
 */

class PerformanceCache {
    constructor() {
        // Code generation cache: workspace hash -> Map<filename, code>
        this.codeCache = new Map();
        
        // Validation cache: workspace hash -> ValidationResult
        this.validationCache = new Map();
        
        // Toolbox structure cache: mode -> toolbox definition
        this.toolboxCache = new Map();
        
        // Block definition cache: blockType -> block definition
        this.blockDefinitionCache = new Map();
        
        // Cache statistics for monitoring
        this.stats = {
            codeHits: 0,
            codeMisses: 0,
            validationHits: 0,
            validationMisses: 0,
            toolboxHits: 0,
            toolboxMisses: 0,
            blockDefHits: 0,
            blockDefMisses: 0
        };
        
        // Cache size limits
        this.maxCodeCacheSize = 50;
        this.maxValidationCacheSize = 100;
        
        console.log('[PerformanceCache] Initialized');
    }
    
    // ========== CODE GENERATION CACHE ==========
    
    /**
     * Get cached generated code for workspace
     * @param {Blockly.Workspace} workspace - Workspace to get code for
     * @returns {Map<string, string>|null} Cached code files or null if not cached
     */
    getCachedCode(workspace) {
        const hash = this.getWorkspaceHash(workspace);
        
        if (this.codeCache.has(hash)) {
            this.stats.codeHits++;
            console.log('[PerformanceCache] Code cache HIT:', hash);
            return this.codeCache.get(hash);
        }
        
        this.stats.codeMisses++;
        console.log('[PerformanceCache] Code cache MISS:', hash);
        return null;
    }
    
    /**
     * Cache generated code for workspace
     * @param {Blockly.Workspace} workspace - Workspace that generated the code
     * @param {Map<string, string>} codeFiles - Generated code files
     */
    setCachedCode(workspace, codeFiles) {
        const hash = this.getWorkspaceHash(workspace);
        
        // Enforce cache size limit (LRU eviction)
        if (this.codeCache.size >= this.maxCodeCacheSize) {
            const firstKey = this.codeCache.keys().next().value;
            this.codeCache.delete(firstKey);
            console.log('[PerformanceCache] Evicted oldest code cache entry');
        }
        
        // Clone the map to avoid external modifications
        const clonedFiles = new Map(codeFiles);
        this.codeCache.set(hash, clonedFiles);
        
        console.log('[PerformanceCache] Cached code for hash:', hash);
    }
    
    /**
     * Invalidate code cache
     */
    invalidateCodeCache() {
        const size = this.codeCache.size;
        this.codeCache.clear();
        console.log(`[PerformanceCache] Invalidated code cache (${size} entries)`);
    }
    
    // ========== VALIDATION CACHE ==========
    
    /**
     * Get cached validation result for workspace
     * @param {Blockly.Workspace} workspace - Workspace to get validation for
     * @returns {Object|null} Cached validation result or null if not cached
     */
    getCachedValidation(workspace) {
        const hash = this.getWorkspaceHash(workspace);
        
        if (this.validationCache.has(hash)) {
            this.stats.validationHits++;
            console.log('[PerformanceCache] Validation cache HIT:', hash);
            return this.validationCache.get(hash);
        }
        
        this.stats.validationMisses++;
        console.log('[PerformanceCache] Validation cache MISS:', hash);
        return null;
    }
    
    /**
     * Cache validation result for workspace
     * @param {Blockly.Workspace} workspace - Workspace that was validated
     * @param {Object} validationResult - Validation result
     */
    setCachedValidation(workspace, validationResult) {
        const hash = this.getWorkspaceHash(workspace);
        
        // Enforce cache size limit (LRU eviction)
        if (this.validationCache.size >= this.maxValidationCacheSize) {
            const firstKey = this.validationCache.keys().next().value;
            this.validationCache.delete(firstKey);
            console.log('[PerformanceCache] Evicted oldest validation cache entry');
        }
        
        // Clone the result to avoid external modifications
        const clonedResult = JSON.parse(JSON.stringify(validationResult));
        this.validationCache.set(hash, clonedResult);
        
        console.log('[PerformanceCache] Cached validation for hash:', hash);
    }
    
    /**
     * Invalidate validation cache
     */
    invalidateValidationCache() {
        const size = this.validationCache.size;
        this.validationCache.clear();
        console.log(`[PerformanceCache] Invalidated validation cache (${size} entries)`);
    }
    
    // ========== TOOLBOX CACHE ==========
    
    /**
     * Get cached toolbox structure for mode
     * @param {string} mode - Editor mode
     * @returns {Object|null} Cached toolbox or null if not cached
     */
    getCachedToolbox(mode) {
        if (this.toolboxCache.has(mode)) {
            this.stats.toolboxHits++;
            console.log('[PerformanceCache] Toolbox cache HIT:', mode);
            return this.toolboxCache.get(mode);
        }
        
        this.stats.toolboxMisses++;
        console.log('[PerformanceCache] Toolbox cache MISS:', mode);
        return null;
    }
    
    /**
     * Cache toolbox structure for mode
     * @param {string} mode - Editor mode
     * @param {Object} toolbox - Toolbox definition
     */
    setCachedToolbox(mode, toolbox) {
        // Clone the toolbox to avoid external modifications
        const clonedToolbox = JSON.parse(JSON.stringify(toolbox));
        this.toolboxCache.set(mode, clonedToolbox);
        
        console.log('[PerformanceCache] Cached toolbox for mode:', mode);
    }
    
    /**
     * Invalidate toolbox cache for specific mode or all modes
     * @param {string|null} mode - Mode to invalidate, or null for all
     */
    invalidateToolboxCache(mode = null) {
        if (mode) {
            this.toolboxCache.delete(mode);
            console.log('[PerformanceCache] Invalidated toolbox cache for mode:', mode);
        } else {
            const size = this.toolboxCache.size;
            this.toolboxCache.clear();
            console.log(`[PerformanceCache] Invalidated all toolbox caches (${size} entries)`);
        }
    }
    
    // ========== BLOCK DEFINITION CACHE ==========
    
    /**
     * Get cached block definition
     * @param {string} blockType - Block type identifier
     * @returns {Object|null} Cached block definition or null if not cached
     */
    getCachedBlockDefinition(blockType) {
        if (this.blockDefinitionCache.has(blockType)) {
            this.stats.blockDefHits++;
            return this.blockDefinitionCache.get(blockType);
        }
        
        this.stats.blockDefMisses++;
        return null;
    }
    
    /**
     * Cache block definition
     * @param {string} blockType - Block type identifier
     * @param {Object} definition - Block definition
     */
    setCachedBlockDefinition(blockType, definition) {
        // Clone the definition to avoid external modifications
        const clonedDef = JSON.parse(JSON.stringify(definition));
        this.blockDefinitionCache.set(blockType, clonedDef);
    }
    
    /**
     * Invalidate block definition cache
     * @param {string|null} blockType - Block type to invalidate, or null for all
     */
    invalidateBlockDefinitionCache(blockType = null) {
        if (blockType) {
            this.blockDefinitionCache.delete(blockType);
            console.log('[PerformanceCache] Invalidated block definition cache for:', blockType);
        } else {
            const size = this.blockDefinitionCache.size;
            this.blockDefinitionCache.clear();
            console.log(`[PerformanceCache] Invalidated all block definition caches (${size} entries)`);
        }
    }
    
    // ========== WORKSPACE HASHING ==========
    
    /**
     * Generate hash for workspace state
     * Uses block count, types, and connections to create a unique identifier
     * @param {Blockly.Workspace} workspace - Workspace to hash
     * @returns {string} Hash string
     */
    getWorkspaceHash(workspace) {
        if (!workspace) {
            return 'empty';
        }
        
        const blocks = workspace.getAllBlocks(false);
        
        if (blocks.length === 0) {
            return 'empty';
        }
        
        // Create a deterministic representation of workspace state
        const blockData = blocks.map(block => {
            return {
                id: block.id,
                type: block.type,
                disabled: block.disabled,
                // Include field values
                fields: this.getBlockFields(block),
                // Include input connections
                inputs: this.getBlockInputs(block)
            };
        });
        
        // Sort by ID for consistency
        blockData.sort((a, b) => a.id.localeCompare(b.id));
        
        // Create hash from JSON representation
        const json = JSON.stringify(blockData);
        return this.simpleHash(json);
    }
    
    /**
     * Get all field values from a block
     * @param {Blockly.Block} block - Block to extract fields from
     * @returns {Object} Field name -> value mapping
     */
    getBlockFields(block) {
        const fields = {};
        
        for (const inputName of block.inputList.map(i => i.name)) {
            const field = block.getField(inputName);
            if (field) {
                fields[inputName] = field.getValue();
            }
        }
        
        return fields;
    }
    
    /**
     * Get all input connections from a block
     * @param {Blockly.Block} block - Block to extract inputs from
     * @returns {Object} Input name -> connected block ID mapping
     */
    getBlockInputs(block) {
        const inputs = {};
        
        for (const input of block.inputList) {
            if (input.connection && input.connection.targetBlock()) {
                inputs[input.name] = input.connection.targetBlock().id;
            }
        }
        
        return inputs;
    }
    
    /**
     * Simple hash function for strings
     * @param {string} str - String to hash
     * @returns {string} Hash string
     */
    simpleHash(str) {
        let hash = 0;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        
        return hash.toString(36);
    }
    
    // ========== CACHE INVALIDATION ==========
    
    /**
     * Invalidate all caches (called on workspace changes)
     */
    invalidateAll() {
        this.invalidateCodeCache();
        this.invalidateValidationCache();
        // Note: Toolbox and block definition caches are not invalidated
        // as they don't depend on workspace state
        
        console.log('[PerformanceCache] Invalidated all workspace-dependent caches');
    }
    
    /**
     * Clear all caches completely
     */
    clearAll() {
        this.invalidateCodeCache();
        this.invalidateValidationCache();
        this.invalidateToolboxCache();
        this.invalidateBlockDefinitionCache();
        
        console.log('[PerformanceCache] Cleared all caches');
    }
    
    // ========== STATISTICS ==========
    
    /**
     * Get cache statistics
     * @returns {Object} Cache hit/miss statistics
     */
    getStats() {
        const codeTotal = this.stats.codeHits + this.stats.codeMisses;
        const validationTotal = this.stats.validationHits + this.stats.validationMisses;
        const toolboxTotal = this.stats.toolboxHits + this.stats.toolboxMisses;
        const blockDefTotal = this.stats.blockDefHits + this.stats.blockDefMisses;
        
        return {
            code: {
                hits: this.stats.codeHits,
                misses: this.stats.codeMisses,
                total: codeTotal,
                hitRate: codeTotal > 0 ? (this.stats.codeHits / codeTotal * 100).toFixed(1) + '%' : 'N/A',
                cacheSize: this.codeCache.size
            },
            validation: {
                hits: this.stats.validationHits,
                misses: this.stats.validationMisses,
                total: validationTotal,
                hitRate: validationTotal > 0 ? (this.stats.validationHits / validationTotal * 100).toFixed(1) + '%' : 'N/A',
                cacheSize: this.validationCache.size
            },
            toolbox: {
                hits: this.stats.toolboxHits,
                misses: this.stats.toolboxMisses,
                total: toolboxTotal,
                hitRate: toolboxTotal > 0 ? (this.stats.toolboxHits / toolboxTotal * 100).toFixed(1) + '%' : 'N/A',
                cacheSize: this.toolboxCache.size
            },
            blockDefinition: {
                hits: this.stats.blockDefHits,
                misses: this.stats.blockDefMisses,
                total: blockDefTotal,
                hitRate: blockDefTotal > 0 ? (this.stats.blockDefHits / blockDefTotal * 100).toFixed(1) + '%' : 'N/A',
                cacheSize: this.blockDefinitionCache.size
            }
        };
    }
    
    /**
     * Log cache statistics to console
     */
    logStats() {
        const stats = this.getStats();
        
        console.log('[PerformanceCache] Statistics:');
        console.log('  Code Generation:', stats.code);
        console.log('  Validation:', stats.validation);
        console.log('  Toolbox:', stats.toolbox);
        console.log('  Block Definitions:', stats.blockDefinition);
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            codeHits: 0,
            codeMisses: 0,
            validationHits: 0,
            validationMisses: 0,
            toolboxHits: 0,
            toolboxMisses: 0,
            blockDefHits: 0,
            blockDefMisses: 0
        };
        
        console.log('[PerformanceCache] Statistics reset');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceCache;
}
