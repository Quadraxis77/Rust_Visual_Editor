/**
 * Toolbox Manager Module
 * 
 * Manages dynamic loading of mode-specific toolboxes with lazy loading support.
 * Handles category loading on-demand, caching, and toolbox validation.
 * 
 * Requirements: 4.5, 5.3, 5.4, 9.1, 9.2, 9.4
 */

class ToolboxManager {
    /**
     * Create a new ToolboxManager
     * @param {Object} workspace - The Blockly workspace (optional)
     * @param {PerformanceCache} performanceCache - Optional performance cache instance
     */
    constructor(workspace = null, performanceCache = null) {
        this.workspace = workspace;
        this.performanceCache = performanceCache;
        this.currentToolbox = null;
        this.currentMode = null;
        this.categoryCache = new Map();  // Cache for loaded categories
        this.toolboxCache = new Map();   // Cache for loaded toolboxes (deprecated, use performanceCache)
        this.loadedCategories = new Set();  // Track which categories are loaded
        this.listeners = new Map();  // Event listeners
        
        // Performance metrics
        this.metrics = {
            toolboxLoads: 0,
            categoryLoads: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        console.log('[Toolbox Manager] Initialized');
    }

    /**
     * Load a mode-specific toolbox
     * @param {string} mode - The mode to load ('rust', 'wgsl', 'bevy')
     * @returns {Promise<Object>} - The loaded toolbox configuration
     */
    async loadToolbox(mode) {
        console.log('[Toolbox Manager] Loading toolbox for mode:', mode);
        console.log('[Toolbox Manager] Workspace available:', !!this.workspace);
        
        // DISABLE CACHING TEMPORARILY TO DEBUG
        // Always load fresh toolbox
        this.metrics.cacheMisses++;
        this.metrics.toolboxLoads++;
        
        try {
            // Load the appropriate toolbox based on mode
            let toolboxConfig = null;
            
            console.log('[Toolbox Manager] Checking toolbox availability for mode:', mode);
            console.log('[Toolbox Manager] RustToolbox available:', typeof RustToolbox !== 'undefined');
            console.log('[Toolbox Manager] WgslToolbox available:', typeof WgslToolbox !== 'undefined');
            console.log('[Toolbox Manager] BevyToolbox available:', typeof BevyToolbox !== 'undefined');
            
            switch (mode) {
                case 'rust':
                    if (typeof RustToolbox !== 'undefined') {
                        console.log('[Toolbox Manager] Loading Rust toolbox...');
                        toolboxConfig = RustToolbox.getToolbox();
                        console.log('[Toolbox Manager] Rust toolbox loaded, categories:', toolboxConfig?.contents?.length);
                    }
                    break;
                    
                case 'wgsl':
                    if (typeof WgslToolbox !== 'undefined') {
                        console.log('[Toolbox Manager] Loading WGSL toolbox...');
                        toolboxConfig = WgslToolbox.getToolbox();
                        console.log('[Toolbox Manager] WGSL toolbox loaded, categories:', toolboxConfig?.contents?.length);
                    }
                    break;
                    
                case 'bevy':
                    if (typeof BevyToolbox !== 'undefined') {
                        console.log('[Toolbox Manager] Loading Bevy toolbox...');
                        toolboxConfig = BevyToolbox.getToolbox();
                        console.log('[Toolbox Manager] Bevy toolbox loaded, categories:', toolboxConfig?.contents?.length);
                    }
                    break;
                    
                default:
                    throw new Error(`Unknown mode: ${mode}`);
            }
            
            if (!toolboxConfig) {
                throw new Error(`Toolbox not found for mode: ${mode}`);
            }
            
            console.log('[Toolbox Manager] Toolbox config loaded successfully');
            
            // Validate the toolbox
            const validation = this.validateToolbox(toolboxConfig);
            if (!validation.valid) {
                console.warn('[Toolbox Manager] Toolbox validation warnings:', validation.warnings);
            }
            
            // Process toolbox for lazy loading
            const processedToolbox = this._processToolboxForLazyLoading(toolboxConfig, mode);
            
            // CACHING DISABLED FOR DEBUGGING
            // Don't cache to ensure fresh toolbox every time
            this.currentToolbox = processedToolbox;
            this.currentMode = mode;
            
            // Update workspace if available
            if (this.workspace) {
                this._updateWorkspaceToolbox(processedToolbox);
            }
            
            console.log('[Toolbox Manager] Toolbox loaded successfully:', mode);
            this._notifyListeners('toolboxLoaded', { mode, fromCache: false });
            
            return processedToolbox;
            
        } catch (error) {
            console.error('[Toolbox Manager] Error loading toolbox:', error);
            this._notifyListeners('toolboxLoadError', { mode, error });
            throw error;
        }
    }

    /**
     * Load a specific category on-demand
     * @param {string} categoryId - The category ID to load
     * @returns {Promise<Object>} - The loaded category configuration
     */
    async loadCategory(categoryId) {
        console.log('[Toolbox Manager] Loading category:', categoryId);
        
        // Check if already loaded
        if (this.loadedCategories.has(categoryId)) {
            console.log('[Toolbox Manager] Category already loaded:', categoryId);
            return this.getCachedCategory(categoryId);
        }
        
        // Check cache
        const cached = this.getCachedCategory(categoryId);
        if (cached) {
            this.metrics.cacheHits++;
            this.loadedCategories.add(categoryId);
            this._notifyListeners('categoryLoaded', { categoryId, fromCache: true });
            return cached;
        }
        
        this.metrics.cacheMisses++;
        this.metrics.categoryLoads++;
        
        try {
            // Find category in current toolbox
            if (!this.currentToolbox) {
                throw new Error('No toolbox loaded');
            }
            
            const category = this._findCategory(this.currentToolbox, categoryId);
            if (!category) {
                throw new Error(`Category not found: ${categoryId}`);
            }
            
            // Load blocks for this category if lazy loading is enabled
            if (category.lazy) {
                await this._loadCategoryBlocks(category);
            }
            
            // Cache the category
            this.categoryCache.set(categoryId, category);
            this.loadedCategories.add(categoryId);
            
            console.log('[Toolbox Manager] Category loaded successfully:', categoryId);
            this._notifyListeners('categoryLoaded', { categoryId, fromCache: false });
            
            return category;
            
        } catch (error) {
            console.error('[Toolbox Manager] Error loading category:', error);
            this._notifyListeners('categoryLoadError', { categoryId, error });
            throw error;
        }
    }

    /**
     * Get a cached category
     * @param {string} categoryId - The category ID
     * @returns {Object|null} - The cached category or null
     */
    getCachedCategory(categoryId) {
        return this.categoryCache.get(categoryId) || null;
    }

    /**
     * Clear all caches to free memory
     */
    clearCache() {
        console.log('[Toolbox Manager] Clearing cache');
        
        const stats = {
            toolboxes: this.toolboxCache.size,
            categories: this.categoryCache.size,
            loadedCategories: this.loadedCategories.size
        };
        
        this.categoryCache.clear();
        this.toolboxCache.clear();
        this.loadedCategories.clear();
        
        // Reset current references but keep mode
        this.currentToolbox = null;
        
        console.log('[Toolbox Manager] Cache cleared:', stats);
        this._notifyListeners('cacheCleared', stats);
    }

    /**
     * Clear cache for a specific mode
     * @param {string} mode - The mode to clear cache for
     */
    clearModeCache(mode) {
        console.log('[Toolbox Manager] Clearing cache for mode:', mode);
        
        this.toolboxCache.delete(mode);
        
        // Clear categories for this mode
        const categoriesToRemove = [];
        this.categoryCache.forEach((category, id) => {
            if (id.startsWith(`${mode}_`)) {
                categoriesToRemove.push(id);
            }
        });
        
        categoriesToRemove.forEach(id => {
            this.categoryCache.delete(id);
            this.loadedCategories.delete(id);
        });
        
        console.log('[Toolbox Manager] Mode cache cleared:', mode);
    }

    /**
     * Validate a toolbox configuration
     * @param {Object} toolbox - The toolbox to validate
     * @returns {Object} - Validation result with valid flag and warnings array
     */
    validateToolbox(toolbox) {
        const result = {
            valid: true,
            warnings: [],
            errors: []
        };
        
        // Check basic structure
        if (!toolbox || typeof toolbox !== 'object') {
            result.valid = false;
            result.errors.push('Toolbox must be an object');
            return result;
        }
        
        if (!toolbox.kind || toolbox.kind !== 'categoryToolbox') {
            result.warnings.push('Toolbox should have kind: "categoryToolbox"');
        }
        
        if (!toolbox.contents || !Array.isArray(toolbox.contents)) {
            result.valid = false;
            result.errors.push('Toolbox must have contents array');
            return result;
        }
        
        // Check for duplicate category names
        const categoryNames = new Set();
        const duplicateCategories = [];
        
        toolbox.contents.forEach((category, index) => {
            if (category.kind === 'category') {
                if (!category.name) {
                    result.warnings.push(`Category at index ${index} missing name`);
                } else {
                    if (categoryNames.has(category.name)) {
                        duplicateCategories.push(category.name);
                    }
                    categoryNames.add(category.name);
                }
                
                // Check for duplicate blocks within category
                if (category.contents && Array.isArray(category.contents)) {
                    const blockTypes = new Set();
                    const duplicateBlocks = [];
                    
                    category.contents.forEach(item => {
                        if (item.kind === 'block' && item.type) {
                            if (blockTypes.has(item.type)) {
                                duplicateBlocks.push(item.type);
                            }
                            blockTypes.add(item.type);
                        }
                    });
                    
                    if (duplicateBlocks.length > 0) {
                        result.warnings.push(
                            `Category "${category.name}" has duplicate blocks: ${duplicateBlocks.join(', ')}`
                        );
                    }
                }
            }
        });
        
        if (duplicateCategories.length > 0) {
            result.warnings.push(
                `Duplicate category names found: ${duplicateCategories.join(', ')}`
            );
        }
        
        // Validation passes if no errors (warnings are acceptable)
        result.valid = result.errors.length === 0;
        
        return result;
    }

    /**
     * Get current toolbox
     * @returns {Object|null} - Current toolbox or null
     */
    getCurrentToolbox() {
        return this.currentToolbox;
    }

    /**
     * Get current mode
     * @returns {string|null} - Current mode or null
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Get all loaded category IDs
     * @returns {Array<string>} - Array of loaded category IDs
     */
    getLoadedCategories() {
        return Array.from(this.loadedCategories);
    }

    /**
     * Check if a category is loaded
     * @param {string} categoryId - The category ID to check
     * @returns {boolean} - True if loaded
     */
    isCategoryLoaded(categoryId) {
        return this.loadedCategories.has(categoryId);
    }

    /**
     * Get performance metrics
     * @returns {Object} - Performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            cacheSize: {
                toolboxes: this.toolboxCache.size,
                categories: this.categoryCache.size
            },
            loadedCategories: this.loadedCategories.size,
            cacheHitRate: this.metrics.cacheHits / 
                (this.metrics.cacheHits + this.metrics.cacheMisses) || 0
        };
    }

    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            toolboxLoads: 0,
            categoryLoads: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        console.log('[Toolbox Manager] Metrics reset');
    }

    /**
     * Register an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        this.listeners.get(event).push(callback);
        
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Remove an event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback to remove
     */
    off(event, callback) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    }

    // Private helper methods

    /**
     * Process toolbox for lazy loading
     * @private
     */
    _processToolboxForLazyLoading(toolbox, mode) {
        // Deep clone to avoid mutating the original
        const processed = JSON.parse(JSON.stringify(toolbox));
        
        // Add mode identifier to categories for caching
        if (processed.contents) {
            processed.contents = processed.contents.map((category, index) => {
                if (category.kind === 'category') {
                    // Remove lazy flag since we're not implementing true lazy loading
                    // Blockly might interpret it incorrectly
                    delete category.lazy;
                    
                    category.id = category.id || `${mode}_category_${index}`;
                    category.mode = mode;
                    
                    return category;
                }
                return category;
            });
        }
        
        return processed;
    }

    /**
     * Find a category in the toolbox
     * @private
     */
    _findCategory(toolbox, categoryId) {
        if (!toolbox || !toolbox.contents) {
            return null;
        }
        
        for (const item of toolbox.contents) {
            if (item.kind === 'category') {
                // Check by ID or name
                if (item.id === categoryId || item.name === categoryId) {
                    return item;
                }
            }
        }
        
        return null;
    }

    /**
     * Load blocks for a category (placeholder for actual block loading)
     * @private
     */
    async _loadCategoryBlocks(category) {
        // In a real implementation, this would dynamically load block definitions
        // For now, we assume blocks are already defined in the block files
        
        // Simulate async loading with a small delay
        await new Promise(resolve => setTimeout(resolve, 10));
        
        console.log('[Toolbox Manager] Blocks loaded for category:', category.name);
    }

    /**
     * Update workspace with new toolbox
     * @private
     */
    _updateWorkspaceToolbox(toolbox) {
        if (!this.workspace) {
            console.warn('[Toolbox Manager] No workspace available');
            return;
        }
        
        try {
            console.log('[Toolbox Manager] Updating workspace toolbox...');
            console.log('[Toolbox Manager] Toolbox structure:', {
                kind: toolbox.kind,
                categories: toolbox.contents?.length || 0
            });
            
            // CRITICAL FIX: Close the flyout before updating toolbox
            // This prevents the "Block not present in workspace's list" error
            try {
                const toolboxInstance = this.workspace.getToolbox();
                if (toolboxInstance) {
                    // Clear any selected category
                    if (toolboxInstance.clearSelection) {
                        toolboxInstance.clearSelection();
                    }
                    
                    // Close the flyout
                    const flyout = this.workspace.getFlyout();
                    if (flyout && flyout.hide) {
                        flyout.hide();
                    }
                }
            } catch (flyoutError) {
                // Ignore flyout errors during cleanup - they're not critical
                console.warn('[Toolbox Manager] Error closing flyout (non-critical):', flyoutError.message);
            }
            
            // Create a fresh deep clone for Blockly
            const freshToolbox = JSON.parse(JSON.stringify(toolbox));
            
            // Use Blockly's updateToolbox method
            if (this.workspace.updateToolbox) {
                this.workspace.updateToolbox(freshToolbox);
                console.log('[Toolbox Manager] Workspace toolbox updated successfully');
            } else {
                console.error('[Toolbox Manager] updateToolbox method not available on workspace');
            }
            
        } catch (error) {
            console.error('[Toolbox Manager] Error updating workspace toolbox:', error);
            console.error('[Toolbox Manager] Error stack:', error.stack);
        }
    }


    /**
     * Notify event listeners
     * @private
     */
    _notifyListeners(event, data) {
        if (!this.listeners.has(event)) {
            return;
        }
        
        const callbacks = this.listeners.get(event);
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('[Toolbox Manager] Error in event listener:', event, error);
            }
        });
    }

    /**
     * Preload categories for better performance
     * @param {Array<string>} categoryIds - Array of category IDs to preload
     * @returns {Promise<void>}
     */
    async preloadCategories(categoryIds) {
        console.log('[Toolbox Manager] Preloading categories:', categoryIds);
        
        const promises = categoryIds.map(id => 
            this.loadCategory(id).catch(error => {
                console.warn('[Toolbox Manager] Failed to preload category:', id, error);
            })
        );
        
        await Promise.all(promises);
        console.log('[Toolbox Manager] Categories preloaded');
    }

    /**
     * Get cache statistics
     * @returns {Object} - Cache statistics
     */
    getCacheStats() {
        return {
            toolboxes: {
                count: this.toolboxCache.size,
                modes: Array.from(this.toolboxCache.keys())
            },
            categories: {
                count: this.categoryCache.size,
                ids: Array.from(this.categoryCache.keys())
            },
            loaded: {
                count: this.loadedCategories.size,
                ids: Array.from(this.loadedCategories)
            }
        };
    }

    /**
     * Reset the toolbox manager
     */
    reset() {
        this.clearCache();
        this.resetMetrics();
        this.currentMode = null;
        console.log('[Toolbox Manager] Reset complete');
    }

    /**
     * Search for blocks matching a query
     * @param {string} query - Search query
     * @returns {Array} - Array of matching blocks with category info
     */
    searchBlocks(query) {
        if (!query || !this.currentToolbox) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const results = [];

        // Search through all categories
        if (this.currentToolbox.contents) {
            this.currentToolbox.contents.forEach(category => {
                if (category.kind === 'category' && category.contents) {
                    category.contents.forEach(item => {
                        if (item.kind === 'block' && item.type) {
                            // Search in block type
                            const blockType = item.type.toLowerCase();
                            const blockName = blockType.replace(/_/g, ' ');
                            
                            // Get block definition for tooltip
                            let tooltip = '';
                            try {
                                const blockDef = Blockly.Blocks[item.type];
                                if (blockDef && blockDef.tooltip) {
                                    tooltip = typeof blockDef.tooltip === 'function' 
                                        ? blockDef.tooltip() 
                                        : blockDef.tooltip;
                                }
                            } catch (e) {
                                // Ignore errors getting tooltip
                            }

                            // Match against type, name, or tooltip
                            if (blockType.includes(searchTerm) || 
                                blockName.includes(searchTerm) ||
                                tooltip.toLowerCase().includes(searchTerm)) {
                                results.push({
                                    type: item.type,
                                    category: category.name,
                                    categoryColour: category.colour,
                                    tooltip: tooltip,
                                    blockDef: item
                                });
                            }
                        } else if (item.kind === 'label') {
                            // Also search labels
                            const labelText = (item.text || '').toLowerCase();
                            if (labelText.includes(searchTerm)) {
                                results.push({
                                    type: 'label',
                                    category: category.name,
                                    categoryColour: category.colour,
                                    text: item.text,
                                    isLabel: true
                                });
                            }
                        }
                    });
                }
            });
        }

        return results;
    }

    /**
     * Filter toolbox to show only matching blocks
     * @param {string} query - Search query
     * @returns {Object} - Filtered toolbox
     */
    filterToolbox(query) {
        if (!query || !this.currentToolbox) {
            return this.currentToolbox;
        }

        const searchResults = this.searchBlocks(query);
        
        if (searchResults.length === 0) {
            // Return empty toolbox with message
            return {
                kind: 'categoryToolbox',
                contents: [{
                    kind: 'category',
                    name: 'No Results',
                    colour: 230,
                    contents: [{
                        kind: 'label',
                        text: `No blocks found for "${query}"`
                    }]
                }]
            };
        }

        // Group results by category
        const categorizedResults = new Map();
        searchResults.forEach(result => {
            if (!categorizedResults.has(result.category)) {
                categorizedResults.set(result.category, {
                    name: result.category,
                    colour: result.categoryColour,
                    blocks: []
                });
            }
            categorizedResults.get(result.category).blocks.push(result);
        });

        // Build filtered toolbox
        const filteredToolbox = {
            kind: 'categoryToolbox',
            contents: []
        };

        categorizedResults.forEach(categoryData => {
            const category = {
                kind: 'category',
                name: `${categoryData.name} (${categoryData.blocks.length})`,
                colour: categoryData.colour,
                contents: categoryData.blocks.map(block => {
                    if (block.isLabel) {
                        return {
                            kind: 'label',
                            text: block.text
                        };
                    }
                    return {
                        kind: 'block',
                        type: block.type
                    };
                })
            };
            filteredToolbox.contents.push(category);
        });

        return filteredToolbox;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolboxManager;
}
