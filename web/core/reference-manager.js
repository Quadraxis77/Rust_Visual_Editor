/**
 * Reference Manager Module
 * 
 * Manages cross-mode references between blocks in different editor modes.
 * Enables visual connections between Rust, WGSL, Bevy, and Biospheres code.
 * Handles reference creation, updates, deletion, and import generation.
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

class ReferenceManager {
    /**
     * Create a new ReferenceManager
     * @param {Object} workspace - The Blockly workspace
     */
    constructor(workspace) {
        this.workspace = workspace;
        
        /**
         * Map of referenceId -> Reference object
         * @type {Map<string, Reference>}
         */
        this.references = new Map();
        
        /**
         * Map of blockId -> Set of referenceIds
         * Tracks which references belong to which blocks
         * @type {Map<string, Set<string>>}
         */
        this.blockReferences = new Map();
        
        /**
         * Counter for generating unique reference IDs
         * @type {number}
         */
        this.referenceCounter = 0;
        
        /**
         * SVG layer for drawing reference links
         * @type {SVGElement|null}
         */
        this.linkLayer = null;
        
        /**
         * Mode color mapping for visual indicators
         * @type {Object}
         */
        this.modeColors = {
            rust: '#CE422B',      // Orange
            wgsl: '#5C2E91',      // Purple
            bevy: '#4EC9B0',      // Green
            biospheres: '#00BCD4' // Cyan
        };
        
        // Initialize the link layer
        this._initializeLinkLayer();
        
        console.log('[Reference Manager] Initialized');
    }

    /**
     * Create a reference from a source block to a target file
     * 
     * @param {Blockly.Block|string} sourceBlock - The source block or block ID
     * @param {string} targetFile - The target file path
     * @param {Object} options - Additional options
     * @param {string} options.targetMode - Target mode (rust, wgsl, bevy, biospheres)
     * @param {string} options.targetSymbol - Specific symbol/function name in target file
     * @param {string} options.description - Human-readable description
     * @returns {Reference} The created reference object
     * 
     * @example
     * const ref = manager.createReference(block, "shader.wgsl", {
     *   targetMode: "wgsl",
     *   targetSymbol: "compute_physics",
     *   description: "Physics compute shader"
     * });
     */
    createReference(sourceBlock, targetFile, options = {}) {
        // Normalize sourceBlock to block ID
        const sourceBlockId = typeof sourceBlock === 'string' 
            ? sourceBlock 
            : sourceBlock.id;
        
        // Validate inputs
        if (!sourceBlockId) {
            throw new Error('Source block ID is required');
        }
        
        if (!targetFile || typeof targetFile !== 'string') {
            throw new Error('Target file must be a non-empty string');
        }
        
        // Get source block object
        const block = this._getBlock(sourceBlockId);
        if (!block) {
            throw new Error(`Block not found: ${sourceBlockId}`);
        }
        
        // Determine source mode
        const sourceMode = this._getModeFromBlock(block);
        
        // Generate unique reference ID
        const referenceId = this._generateReferenceId();
        
        // Create reference object
        const reference = {
            id: referenceId,
            sourceBlockId: sourceBlockId,
            sourceMode: sourceMode,
            targetFile: targetFile,
            targetMode: options.targetMode || this._inferModeFromFile(targetFile),
            targetSymbol: options.targetSymbol || null,
            description: options.description || `Reference to ${targetFile}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Store reference
        this.references.set(referenceId, reference);
        
        // Track block -> reference mapping
        if (!this.blockReferences.has(sourceBlockId)) {
            this.blockReferences.set(sourceBlockId, new Set());
        }
        this.blockReferences.get(sourceBlockId).add(referenceId);
        
        // Draw visual link
        this.drawReferenceLinks();
        
        console.log('[Reference Manager] Created reference:', reference);
        
        return reference;
    }

    /**
     * Update an existing reference
     * 
     * @param {string} referenceId - The reference ID to update
     * @param {string} newTarget - The new target file path
     * @param {Object} options - Additional options to update
     * @returns {Reference|null} The updated reference, or null if not found
     * 
     * @example
     * manager.updateReference("ref_001", "new_shader.wgsl", {
     *   targetSymbol: "new_compute_function"
     * });
     */
    updateReference(referenceId, newTarget, options = {}) {
        // Validate inputs
        if (!referenceId) {
            throw new Error('Reference ID is required');
        }
        
        // Get existing reference
        const reference = this.references.get(referenceId);
        if (!reference) {
            console.warn('[Reference Manager] Reference not found:', referenceId);
            return null;
        }
        
        // Update target file if provided
        if (newTarget && typeof newTarget === 'string') {
            reference.targetFile = newTarget;
            reference.targetMode = options.targetMode || this._inferModeFromFile(newTarget);
        }
        
        // Update other fields if provided
        if (options.targetSymbol !== undefined) {
            reference.targetSymbol = options.targetSymbol;
        }
        
        if (options.description !== undefined) {
            reference.description = options.description;
        }
        
        // Update timestamp
        reference.updatedAt = new Date().toISOString();
        
        // Redraw visual links
        this.drawReferenceLinks();
        
        console.log('[Reference Manager] Updated reference:', reference);
        
        return reference;
    }

    /**
     * Delete a reference
     * 
     * @param {string} referenceId - The reference ID to delete
     * @returns {boolean} True if reference was deleted, false if not found
     * 
     * @example
     * manager.deleteReference("ref_001");
     */
    deleteReference(referenceId) {
        // Validate input
        if (!referenceId) {
            throw new Error('Reference ID is required');
        }
        
        // Get reference
        const reference = this.references.get(referenceId);
        if (!reference) {
            console.warn('[Reference Manager] Reference not found:', referenceId);
            return false;
        }
        
        // Remove from block references mapping
        const blockRefs = this.blockReferences.get(reference.sourceBlockId);
        if (blockRefs) {
            blockRefs.delete(referenceId);
            
            // Clean up empty sets
            if (blockRefs.size === 0) {
                this.blockReferences.delete(reference.sourceBlockId);
            }
        }
        
        // Remove reference
        this.references.delete(referenceId);
        
        // Redraw visual links
        this.drawReferenceLinks();
        
        console.log('[Reference Manager] Deleted reference:', referenceId);
        
        return true;
    }

    /**
     * Get all references for a specific block
     * 
     * @param {string} blockId - The block ID to query
     * @returns {Reference[]} Array of reference objects
     * 
     * @example
     * const refs = manager.getReferences(block.id);
     * refs.forEach(ref => console.log(ref.targetFile));
     */
    getReferences(blockId) {
        if (!blockId) {
            return [];
        }
        
        const referenceIds = this.blockReferences.get(blockId);
        if (!referenceIds || referenceIds.size === 0) {
            return [];
        }
        
        // Collect all reference objects
        const references = [];
        for (const refId of referenceIds) {
            const ref = this.references.get(refId);
            if (ref) {
                references.push({ ...ref }); // Return copy
            }
        }
        
        return references;
    }

    /**
     * Get all references in the workspace
     * 
     * @returns {Reference[]} Array of all reference objects
     */
    getAllReferences() {
        return Array.from(this.references.values()).map(ref => ({ ...ref }));
    }

    /**
     * Draw visual links for all cross-mode references
     * 
     * Creates dashed lines with gradients between blocks in different modes
     * to visualize cross-mode connections.
     * 
     * @example
     * manager.drawReferenceLinks();
     */
    drawReferenceLinks() {
        if (!this.linkLayer) {
            this._initializeLinkLayer();
        }
        
        // Use performance optimizer if available
        if (typeof performanceOptimizer !== 'undefined' && performanceOptimizer) {
            const references = Array.from(this.references.values());
            
            performanceOptimizer.optimizeReferenceLinkDrawing(
                references,
                (ref) => this._createReferenceElement(ref)
            );
        } else {
            // Fallback to direct drawing
            this._clearLinks();
            
            for (const reference of this.references.values()) {
                this._drawReferenceLink(reference);
            }
        }
    }
    
    /**
     * Create a reference link element (for optimized batch rendering)
     * @private
     */
    _createReferenceElement(reference) {
        // This would create and return a DOM element for the reference
        // Implementation depends on how references are visually represented
        const element = document.createElement('div');
        element.className = 'reference-link';
        element.dataset.referenceId = reference.id;
        
        // Add visual styling based on reference type
        element.style.borderColor = this._getColorForMode(reference.sourceMode);
        
        return element;
    }
    
    /**
     * Get color for a mode
     * @private
     */
    _getColorForMode(mode) {
        const colors = {
            rust: '#CE422B',
            wgsl: '#5C2E91',
            bevy: '#4EC9B0',
            biospheres: '#00BCD4'
        };
        return colors[mode] || '#888';
    }

    /**
     * Generate import statements for all references
     * 
     * @param {Reference[]} references - Array of references (optional, uses all if not provided)
     * @returns {Map<string, string[]>} Map of sourceFile -> array of import statements
     * 
     * @example
     * const imports = manager.generateImports();
     * imports.get('main.rs') // Returns: ['use crate::shader::compute_physics;']
     */
    generateImports(references = null) {
        const refs = references || this.getAllReferences();
        const importsByFile = new Map();
        
        for (const ref of refs) {
            // Determine source file from block
            const sourceBlock = this._getBlock(ref.sourceBlockId);
            if (!sourceBlock) {
                continue;
            }
            
            const sourceFile = this._getFileForBlock(sourceBlock);
            
            // Generate import statement based on modes
            const importStatement = this._generateImportStatement(ref);
            
            if (importStatement) {
                if (!importsByFile.has(sourceFile)) {
                    importsByFile.set(sourceFile, []);
                }
                
                // Avoid duplicates
                const imports = importsByFile.get(sourceFile);
                if (!imports.includes(importStatement)) {
                    imports.push(importStatement);
                }
            }
        }
        
        return importsByFile;
    }

    /**
     * Clear all references
     */
    clearAll() {
        this.references.clear();
        this.blockReferences.clear();
        this._clearLinks();
        console.log('[Reference Manager] Cleared all references');
    }

    /**
     * Export references to JSON
     * 
     * @returns {string} JSON string of all references
     */
    exportReferences() {
        const data = {
            references: this.getAllReferences(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    /**
     * Import references from JSON
     * 
     * @param {string} jsonData - JSON string of references
     * @returns {number} Number of references imported
     */
    importReferences(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.references || !Array.isArray(data.references)) {
                throw new Error('Invalid reference data format');
            }
            
            let imported = 0;
            
            for (const ref of data.references) {
                // Validate reference has required fields
                if (!ref.sourceBlockId || !ref.targetFile) {
                    console.warn('[Reference Manager] Skipping invalid reference:', ref);
                    continue;
                }
                
                // Check if source block exists
                const block = this._getBlock(ref.sourceBlockId);
                if (!block) {
                    console.warn('[Reference Manager] Source block not found:', ref.sourceBlockId);
                    continue;
                }
                
                // Create reference
                this.createReference(ref.sourceBlockId, ref.targetFile, {
                    targetMode: ref.targetMode,
                    targetSymbol: ref.targetSymbol,
                    description: ref.description
                });
                
                imported++;
            }
            
            console.log(`[Reference Manager] Imported ${imported} references`);
            return imported;
            
        } catch (error) {
            console.error('[Reference Manager] Error importing references:', error);
            throw error;
        }
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Initialize the SVG layer for drawing reference links
     * @private
     */
    _initializeLinkLayer() {
        if (!this.workspace) {
            return;
        }
        
        // Try to get the workspace SVG
        const workspaceSvg = this.workspace.getParentSvg?.();
        
        if (workspaceSvg) {
            // Create or get the link layer
            let layer = workspaceSvg.querySelector('#reference-link-layer');
            
            if (!layer) {
                layer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                layer.id = 'reference-link-layer';
                layer.setAttribute('class', 'reference-links');
                
                // Insert as first child so links appear behind blocks
                workspaceSvg.insertBefore(layer, workspaceSvg.firstChild);
            }
            
            this.linkLayer = layer;
        }
    }

    /**
     * Clear all drawn links
     * @private
     */
    _clearLinks() {
        if (this.linkLayer) {
            while (this.linkLayer.firstChild) {
                this.linkLayer.removeChild(this.linkLayer.firstChild);
            }
        }
    }

    /**
     * Draw a visual link for a single reference
     * @private
     */
    _drawReferenceLink(reference) {
        if (!this.linkLayer) {
            return;
        }
        
        // Get source block
        const sourceBlock = this._getBlock(reference.sourceBlockId);
        if (!sourceBlock) {
            return;
        }
        
        // Get block position
        const blockPos = this._getBlockPosition(sourceBlock);
        if (!blockPos) {
            return;
        }
        
        // Create visual indicator
        // For now, we'll draw a small icon/badge on the block
        // In a full implementation, this would draw lines to target blocks
        
        const indicator = this._createReferenceIndicator(reference, blockPos);
        if (indicator) {
            this.linkLayer.appendChild(indicator);
        }
    }

    /**
     * Create a visual indicator for a reference
     * @private
     */
    _createReferenceIndicator(reference, position) {
        // Create a group for the indicator
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'reference-indicator');
        group.setAttribute('data-reference-id', reference.id);
        
        // Create gradient for cross-mode visual
        const gradientId = `gradient-${reference.id}`;
        const gradient = this._createGradient(
            gradientId,
            this.modeColors[reference.sourceMode],
            this.modeColors[reference.targetMode]
        );
        
        // Add gradient to defs
        let defs = this.linkLayer.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this.linkLayer.appendChild(defs);
        }
        defs.appendChild(gradient);
        
        // Create dashed line indicator (small arrow or badge)
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        badge.setAttribute('x', position.x + position.width - 20);
        badge.setAttribute('y', position.y + 5);
        badge.setAttribute('width', '15');
        badge.setAttribute('height', '15');
        badge.setAttribute('rx', '3');
        badge.setAttribute('fill', `url(#${gradientId})`);
        badge.setAttribute('stroke', '#000');
        badge.setAttribute('stroke-width', '1');
        badge.setAttribute('stroke-dasharray', '2,2');
        
        // Add link icon (simplified)
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', position.x + position.width - 17);
        icon.setAttribute('y', position.y + 16);
        icon.setAttribute('font-size', '10');
        icon.setAttribute('fill', '#fff');
        icon.textContent = '🔗';
        
        // Add tooltip
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `Reference to ${reference.targetFile}${reference.targetSymbol ? ` (${reference.targetSymbol})` : ''}`;
        
        group.appendChild(badge);
        group.appendChild(icon);
        group.appendChild(title);
        
        return group;
    }

    /**
     * Create an SVG gradient
     * @private
     */
    _createGradient(id, startColor, endColor) {
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', id);
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', startColor);
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', endColor);
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        
        return gradient;
    }

    /**
     * Get a block by ID
     * @private
     */
    _getBlock(blockId) {
        if (!this.workspace) {
            return null;
        }
        
        return this.workspace.getBlockById?.(blockId) || null;
    }

    /**
     * Get block position
     * @private
     */
    _getBlockPosition(block) {
        if (!block) {
            return null;
        }
        
        // Try to get position from block
        const xy = block.getRelativeToSurfaceXY?.();
        if (!xy) {
            return null;
        }
        
        // Get block dimensions
        const width = block.width || 100;
        const height = block.height || 50;
        
        return {
            x: xy.x,
            y: xy.y,
            width: width,
            height: height
        };
    }

    /**
     * Determine mode from block type
     * @private
     */
    _getModeFromBlock(block) {
        if (!block || !block.type) {
            return 'rust';
        }
        
        const blockType = block.type.toLowerCase();
        
        if (blockType.startsWith('wgsl_')) {
            return 'wgsl';
        } else if (blockType.startsWith('bevy_')) {
            return 'bevy';
        } else if (blockType.startsWith('bio_')) {
            return 'biospheres';
        } else if (blockType.startsWith('rust_')) {
            return 'rust';
        }
        
        return 'rust';
    }

    /**
     * Infer mode from file extension
     * @private
     */
    _inferModeFromFile(filename) {
        if (!filename) {
            return 'rust';
        }
        
        const lower = filename.toLowerCase();
        
        if (lower.endsWith('.wgsl')) {
            return 'wgsl';
        } else if (lower.includes('system') || lower.includes('bevy')) {
            return 'bevy';
        } else if (lower.includes('cell') || lower.includes('genome') || lower.includes('bio')) {
            return 'biospheres';
        } else if (lower.endsWith('.rs')) {
            return 'rust';
        }
        
        return 'rust';
    }

    /**
     * Get the file for a block (uses default file names)
     * @private
     */
    _getFileForBlock(block) {
        const mode = this._getModeFromBlock(block);
        
        const defaultFiles = {
            rust: 'main.rs',
            wgsl: 'shader.wgsl',
            bevy: 'systems.rs',
            biospheres: 'cells.rs'
        };
        
        return defaultFiles[mode] || 'output.txt';
    }

    /**
     * Generate an import statement for a reference
     * @private
     */
    _generateImportStatement(reference) {
        const { sourceMode, targetMode, targetFile, targetSymbol } = reference;
        
        // Rust importing from WGSL (shader reference)
        if (sourceMode === 'rust' && targetMode === 'wgsl') {
            return `// Reference to shader: ${targetFile}`;
        }
        
        // Bevy importing from WGSL (shader reference)
        if (sourceMode === 'bevy' && targetMode === 'wgsl') {
            return `// Shader reference: ${targetFile}`;
        }
        
        // Rust importing from Rust
        if (sourceMode === 'rust' && targetMode === 'rust') {
            if (targetSymbol) {
                return `use crate::${this._fileToModule(targetFile)}::${targetSymbol};`;
            }
            return `use crate::${this._fileToModule(targetFile)}::*;`;
        }
        
        // Bevy importing from Bevy
        if (sourceMode === 'bevy' && targetMode === 'bevy') {
            if (targetSymbol) {
                return `use crate::${this._fileToModule(targetFile)}::${targetSymbol};`;
            }
            return `use crate::${this._fileToModule(targetFile)}::*;`;
        }
        
        // Biospheres importing from Biospheres
        if (sourceMode === 'biospheres' && targetMode === 'biospheres') {
            if (targetSymbol) {
                return `use crate::${this._fileToModule(targetFile)}::${targetSymbol};`;
            }
            return `use crate::${this._fileToModule(targetFile)}::*;`;
        }
        
        // Cross-mode references (Bevy <-> Biospheres)
        if ((sourceMode === 'bevy' && targetMode === 'biospheres') ||
            (sourceMode === 'biospheres' && targetMode === 'bevy')) {
            if (targetSymbol) {
                return `use crate::${this._fileToModule(targetFile)}::${targetSymbol};`;
            }
            return `use crate::${this._fileToModule(targetFile)}::*;`;
        }
        
        // Generic comment for other cross-mode references
        return `// Reference to ${targetFile}${targetSymbol ? ` (${targetSymbol})` : ''}`;
    }

    /**
     * Convert file name to module name
     * @private
     */
    _fileToModule(filename) {
        // Remove extension
        let module = filename.replace(/\.(rs|wgsl)$/, '');
        
        // Replace path separators with ::
        module = module.replace(/[\/\\]/g, '::');
        
        return module;
    }

    /**
     * Generate a unique reference ID
     * @private
     */
    _generateReferenceId() {
        this.referenceCounter++;
        return `ref_${String(this.referenceCounter).padStart(6, '0')}`;
    }
}

/**
 * Reference type definition
 * @typedef {Object} Reference
 * @property {string} id - Unique reference ID
 * @property {string} sourceBlockId - ID of the source block
 * @property {string} sourceMode - Mode of the source block (rust, wgsl, bevy, biospheres)
 * @property {string} targetFile - Path to the target file
 * @property {string} targetMode - Mode of the target file
 * @property {string|null} targetSymbol - Specific symbol/function name in target file
 * @property {string} description - Human-readable description
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 */

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReferenceManager;
}
