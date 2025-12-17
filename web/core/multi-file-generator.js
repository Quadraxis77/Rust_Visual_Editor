/**
 * Multi-File Generator for Blockly System
 * 
 * Manages code generation for multiple files with support for:
 * - Organizing blocks by target file
 * - Generating code for all files in a workspace
 * - Default file names per mode
 * - Project bundle export as ZIP
 * - Tabbed interface for displaying multiple files
 * 
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5
 */

class MultiFileGenerator {
    constructor(generators, performanceCache = null) {
        /**
         * Map of mode -> CodeGenerator
         * @type {Map<string, Object>}
         */
        this.generators = generators || new Map();
        
        /**
         * Map of blockId -> filename
         * Tracks which file each block should generate code into
         * @type {Map<string, string>}
         */
        this.blockFileAssignments = new Map();
        
        /**
         * Default file names for each mode
         * @type {Object}
         */
        this.defaultFiles = {
            rust: 'main.rs',
            wgsl: 'shader.wgsl',
            bevy: 'systems.rs',
            biospheres: 'cells.rs'
        };
        
        /**
         * Performance cache instance
         * @type {PerformanceCache|null}
         */
        this.performanceCache = performanceCache;
        
        /**
         * Local cache for generated code (deprecated, use performanceCache)
         * @type {Map<string, string>}
         */
        this.codeCache = new Map();
        
        /**
         * Track if cache is valid (deprecated, use performanceCache)
         * @type {boolean}
         */
        this.cacheValid = false;
    }

    /**
     * Generate code for all files in the workspace
     * 
     * @param {Blockly.Workspace} workspace - The Blockly workspace
     * @returns {Map<string, string>} Map of filename -> generated code
     * 
     * @example
     * const files = generator.generateAll(workspace);
     * files.get('main.rs') // Returns Rust code
     * files.get('shader.wgsl') // Returns WGSL code
     */
    generateAll(workspace) {
        if (!workspace) {
            throw new Error('Workspace is required');
        }

        // Check performance cache first
        if (this.performanceCache) {
            const cachedCode = this.performanceCache.getCachedCode(workspace);
            if (cachedCode) {
                console.log('[MultiFileGenerator] Using cached code');
                return new Map(cachedCode);
            }
        }

        // Clear local cache
        this.codeCache.clear();
        
        // Group blocks by file and mode
        const fileBlocks = this._groupBlocksByFile(workspace);
        
        // Generate code for each file
        for (const [filename, blocksByMode] of fileBlocks.entries()) {
            let fileCode = '';
            
            // Generate code for each mode in this file
            for (const [mode, blocks] of blocksByMode.entries()) {
                const generator = this.generators.get(mode);
                
                if (!generator) {
                    console.warn(`No generator found for mode: ${mode}`);
                    continue;
                }
                
                // Generate code for these blocks
                const modeCode = this._generateCodeForBlocks(generator, blocks, workspace);
                
                if (modeCode && modeCode.trim()) {
                    // Add mode separator comment if multiple modes in one file
                    if (fileCode && blocksByMode.size > 1) {
                        fileCode += `\n// ========== ${mode.toUpperCase()} CODE ==========\n\n`;
                    }
                    fileCode += modeCode;
                }
            }
            
            // Store generated code
            if (fileCode.trim()) {
                this.codeCache.set(filename, fileCode);
            }
        }
        
        // Store in performance cache
        if (this.performanceCache) {
            this.performanceCache.setCachedCode(workspace, this.codeCache);
        }
        
        // Mark local cache as valid
        this.cacheValid = true;
        
        return new Map(this.codeCache);
    }

    /**
     * Get the target file for a specific block
     * 
     * @param {Blockly.Block} block - The block to check
     * @returns {string} The filename this block should generate code into
     * 
     * @example
     * const filename = generator.getFileForBlock(block);
     * // Returns: "main.rs" or custom assigned file
     */
    getFileForBlock(block) {
        if (!block) {
            throw new Error('Block is required');
        }

        // Check if block has explicit file assignment
        if (this.blockFileAssignments.has(block.id)) {
            return this.blockFileAssignments.get(block.id);
        }
        
        // Determine mode from block type
        const mode = this._getModeFromBlock(block);
        
        // Return default file for this mode
        return this.defaultFiles[mode] || 'output.txt';
    }

    /**
     * Assign a block to a specific output file
     * 
     * @param {Blockly.Block} block - The block to assign
     * @param {string} filename - The target filename
     * 
     * @example
     * generator.setFileForBlock(block, "custom.rs");
     */
    setFileForBlock(block, filename) {
        if (!block) {
            throw new Error('Block is required');
        }
        
        if (!filename || typeof filename !== 'string') {
            throw new Error('Filename must be a non-empty string');
        }

        this.blockFileAssignments.set(block.id, filename);
        
        // Invalidate cache
        this.cacheValid = false;
    }

    /**
     * Export all generated files as a ZIP archive
     * 
     * @param {Map<string, string>} files - Map of filename -> code content
     * @returns {Blob} ZIP file as a Blob
     * 
     * @example
     * const files = generator.generateAll(workspace);
     * const zipBlob = generator.exportAsZip(files);
     * // Download or save the ZIP file
     */
    exportAsZip(files) {
        if (!files || !(files instanceof Map)) {
            throw new Error('Files must be a Map');
        }

        // Check if JSZip is available
        if (typeof JSZip === 'undefined') {
            throw new Error('JSZip library is required for ZIP export');
        }

        const zip = new JSZip();
        
        // Add each file to the ZIP
        for (const [filename, content] of files.entries()) {
            zip.file(filename, content);
        }
        
        // Generate ZIP file
        return zip.generateAsync({ type: 'blob' });
    }

    /**
     * Clear all file assignments and cache
     */
    clear() {
        this.blockFileAssignments.clear();
        this.codeCache.clear();
        this.cacheValid = false;
    }

    /**
     * Invalidate the code cache
     * Call this when the workspace changes
     */
    invalidateCache() {
        this.cacheValid = false;
        
        // Invalidate performance cache
        if (this.performanceCache) {
            this.performanceCache.invalidateCodeCache();
        }
    }

    /**
     * Get all files that have been generated
     * 
     * @returns {string[]} Array of filenames
     */
    getGeneratedFiles() {
        return Array.from(this.codeCache.keys());
    }

    /**
     * Check if a specific file has been generated
     * 
     * @param {string} filename - The filename to check
     * @returns {boolean} True if file exists
     */
    hasFile(filename) {
        return this.codeCache.has(filename);
    }

    /**
     * Get the code for a specific file
     * 
     * @param {string} filename - The filename
     * @returns {string|null} The code content, or null if not found
     */
    getFileCode(filename) {
        return this.codeCache.get(filename) || null;
    }

    // ========== PRIVATE METHODS ==========

    /**
     * Group blocks by their target file and mode
     * @private
     */
    _groupBlocksByFile(workspace) {
        const fileBlocks = new Map();
        const fileContainerNames = new Map(); // Track file_container block IDs by filename
        
        // Get all top-level blocks
        const topBlocks = workspace.getTopBlocks(true);
        
        for (const block of topBlocks) {
            // Skip disabled blocks
            if (!block.isEnabled()) {
                continue;
            }
            
            // Check if this is a file_container or wgsl_file_container block
            if (block.type === 'file_container' || block.type === 'wgsl_file_container') {
                const filename = block.getFieldValue('FILENAME') || (block.type === 'wgsl_file_container' ? 'untitled.wgsl' : 'untitled.rs');
                
                // Check for duplicate filenames
                if (fileContainerNames.has(filename)) {
                    throw new Error(`Duplicate file name: "${filename}". Each file container must have a unique filename.`);
                }
                
                fileContainerNames.set(filename, block.id);
                
                // Get all blocks inside the file container
                const contentsBlock = block.getInputTargetBlock('CONTENTS');
                if (contentsBlock) {
                    this._addBlockAndChildren(contentsBlock, filename, fileBlocks);
                }
            }
            // Ignore blocks not in file containers - they won't be generated
        }
        
        return fileBlocks;
    }
    
    /**
     * Add a block and all its children to a file
     * @private
     */
    _addBlockAndChildren(block, filename, fileBlocks) {
        if (!block) return;
        
        // Only add the first block in the chain
        // The generator's blockToCode will handle the rest via nextBlock
        this._addBlockToFile(block, filename, fileBlocks);
        
        // DO NOT recursively add next blocks - they will be generated
        // automatically by the generator when it processes this block
    }
    
    /**
     * Add a single block to the file/mode map
     * @private
     */
    _addBlockToFile(block, filename, fileBlocks) {
        const mode = this._getModeFromBlock(block);
        
        // Initialize file entry if needed
        if (!fileBlocks.has(filename)) {
            fileBlocks.set(filename, new Map());
        }
        
        // Initialize mode entry if needed
        const modeMap = fileBlocks.get(filename);
        if (!modeMap.has(mode)) {
            modeMap.set(mode, []);
        }
        
        // Add block to this file/mode
        modeMap.get(mode).push(block);
    }

    /**
     * Generate code for a specific set of blocks using a generator
     * @private
     */
    _generateCodeForBlocks(generator, blocks, workspace) {
        if (!generator || !blocks || blocks.length === 0) {
            return '';
        }

        // Initialize generator if it has an init method
        if (typeof generator.init === 'function') {
            generator.init(workspace);
        }

        let code = '';
        
        // Generate code for each block individually
        for (const block of blocks) {
            if (typeof generator.blockToCode === 'function') {
                let blockCode = generator.blockToCode(block);
                
                // Handle array return values
                if (Array.isArray(blockCode)) {
                    blockCode = blockCode[0];
                }
                
                if (blockCode && blockCode.trim()) {
                    code += blockCode + '\n';
                }
            }
        }
        
        // Finish code generation if generator has a finish method
        // This is where imports are added for Rust
        if (typeof generator.finish === 'function') {
            code = generator.finish(code);
        }
        
        return code;
    }

    /**
     * Determine the mode from a block's type
     * @private
     */
    _getModeFromBlock(block) {
        if (!block || !block.type) {
            return 'rust'; // Default mode
        }

        const blockType = block.type.toLowerCase();
        
        // Check block type prefix
        if (blockType.startsWith('wgsl_')) {
            return 'wgsl';
        } else if (blockType.startsWith('bevy_') || blockType.startsWith('game_')) {
            return 'bevy';
        } else if (blockType.startsWith('bio_')) {
            return 'biospheres';
        } else if (blockType.startsWith('rust_')) {
            return 'rust';
        }
        
        // Check for legacy block types
        if (blockType.includes('shader') || blockType.includes('compute')) {
            return 'wgsl';
        }
        
        if (blockType.includes('cell') || blockType.includes('genome') || blockType.includes('adhesion')) {
            return 'biospheres';
        }
        
        if (blockType.includes('query') || blockType.includes('system') || blockType.includes('component')) {
            return 'bevy';
        }
        
        // Default to rust
        return 'rust';
    }

    /**
     * Generate default files when no explicit assignments exist
     * @private
     */
    _generateDefaultFiles(workspace) {
        // Detect which modes are present in the workspace
        const modesPresent = new Set();
        const allBlocks = workspace.getAllBlocks(false);
        
        for (const block of allBlocks) {
            if (block.isEnabled()) {
                const mode = this._getModeFromBlock(block);
                modesPresent.add(mode);
            }
        }
        
        // Generate code for each mode present
        for (const mode of modesPresent) {
            const generator = this.generators.get(mode);
            
            if (generator && typeof generator.workspaceToCode === 'function') {
                const code = generator.workspaceToCode(workspace);
                
                if (code && code.trim()) {
                    const filename = this.defaultFiles[mode] || `${mode}.txt`;
                    this.codeCache.set(filename, code);
                }
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiFileGenerator;
}
