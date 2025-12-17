/**
 * Mode Manager Module
 * 
 * Manages editor mode switching between Rust, WGSL, and Bevy modes.
 * Handles mode transitions, resource loading, and mode-specific configurations.
 * 
 * Requirements: 2.1, 2.2, 2.3, 10.1, 10.5
 */

// Mode configurations for all four editor modes
const MODES = {
    rust: {
        mode: 'rust',
        displayName: 'Rust',
        fileExtension: 'rs',
        mimeType: 'text/x-rust',
        toolbox: 'rust-toolbox',
        defaultFile: 'main.rs',
        description: 'General-purpose Rust programming',
        theme: {
            primaryColor: '#D65C5C',  // Blockly hue 230 (reddish-orange)
            blockColor: 230,
            categoryColor: '230'
        },
        imports: [
            'use std::collections::*;',
            'use std::fmt;'
        ],
        validator: 'rust'
    },
    wgsl: {
        mode: 'wgsl',
        displayName: 'WGSL',
        fileExtension: 'wgsl',
        mimeType: 'text/wgsl',
        toolbox: 'wgsl-toolbox',
        defaultFile: 'shader.wgsl',
        description: 'WebGPU Shading Language',
        theme: {
            primaryColor: '#A55B99',  // Blockly hue 270 (purple/magenta)
            blockColor: 270,
            categoryColor: '270'
        },
        imports: [],
        validator: 'wgsl'
    },
    bevy: {
        mode: 'bevy',
        displayName: 'Bevy',
        fileExtension: 'rs',
        mimeType: 'text/x-rust',
        toolbox: 'bevy-toolbox',
        defaultFile: 'systems.rs',
        description: 'Bevy ECS game engine',
        theme: {
            primaryColor: '#5BA55B',  // Blockly hue 160 (green)
            blockColor: 160,
            categoryColor: '160'
        },
        imports: [
            'use bevy::prelude::*;',
            'use bevy::ecs::system::*;'
        ],
        validator: 'rust'  // Bevy uses Rust syntax
    }
};

class ModeManager {
    /**
     * Create a new ModeManager
     * @param {Object} workspace - The Blockly workspace
     * @param {Object} toolboxManager - The toolbox manager instance (optional)
     */
    constructor(workspace, toolboxManager = null) {
        this.workspace = workspace;
        this.toolboxManager = toolboxManager;
        this.currentMode = 'rust';  // Default mode
        this.previousMode = null;
        this.modeHistory = ['rust'];
        this.listeners = new Map();  // Event listeners for mode changes
        
        // Initialize mode state
        this._initializeMode();
    }

    /**
     * Initialize the mode manager
     * @private
     */
    _initializeMode() {
        // Set up initial mode configuration
        this._applyModeTheme(this.currentMode);
        
        // Log initialization
        console.log('[Mode Manager] Initialized with mode:', this.currentMode);
    }

    /**
     * Switch to a different editor mode
     * @param {string} mode - The target mode ('rust', 'wgsl', 'bevy')
     * @returns {Promise<boolean>} - True if switch was successful
     */
    async switchMode(mode) {
        // Validate mode
        if (!this.validateModeSwitch(this.currentMode, mode)) {
            console.error('[Mode Manager] Invalid mode switch:', this.currentMode, '->', mode);
            return false;
        }

        // Check if already in target mode
        if (this.currentMode === mode) {
            console.log('[Mode Manager] Already in mode:', mode);
            return true;
        }

        console.log('[Mode Manager] Switching mode:', this.currentMode, '->', mode);

        try {
            // Store previous mode
            this.previousMode = this.currentMode;

            // Notify listeners of mode change start
            this._notifyListeners('beforeModeChange', {
                from: this.currentMode,
                to: mode
            });

            // Update current mode
            this.currentMode = mode;
            this.modeHistory.push(mode);

            // Apply mode-specific theme
            this._applyModeTheme(mode);

            // Load mode-specific toolbox if toolbox manager is available
            if (this.toolboxManager) {
                await this.toolboxManager.loadToolbox(mode);
            }

            // Update workspace to show blocks from all modes
            // (Workspace preserves all blocks, just changes available toolbox)
            this._updateWorkspaceForMode(mode);

            // Notify listeners of mode change completion
            this._notifyListeners('afterModeChange', {
                from: this.previousMode,
                to: mode
            });

            console.log('[Mode Manager] Mode switch complete:', mode);
            return true;

        } catch (error) {
            console.error('[Mode Manager] Error switching mode:', error);
            
            // Revert to previous mode on error
            this.currentMode = this.previousMode;
            
            // Notify listeners of error
            this._notifyListeners('modeChangeError', {
                from: this.previousMode,
                to: mode,
                error: error
            });
            
            return false;
        }
    }

    /**
     * Get the current active mode
     * @returns {string} - The current mode name
     */
    getCurrentMode() {
        return this.currentMode;
    }

    /**
     * Get configuration for a specific mode
     * @param {string} mode - The mode to get configuration for
     * @returns {Object|null} - Mode configuration object or null if invalid
     */
    getModeConfig(mode) {
        if (!MODES[mode]) {
            console.warn('[Mode Manager] Unknown mode:', mode);
            return null;
        }
        
        // Return a copy to prevent external modification
        return { ...MODES[mode] };
    }

    /**
     * Get configuration for the current mode
     * @returns {Object} - Current mode configuration
     */
    getCurrentModeConfig() {
        return this.getModeConfig(this.currentMode);
    }

    /**
     * Get all available modes
     * @returns {Array<Object>} - Array of mode configurations
     */
    getAllModes() {
        return Object.values(MODES).map(config => ({ ...config }));
    }

    /**
     * Get mode names
     * @returns {Array<string>} - Array of mode names
     */
    getModeNames() {
        return Object.keys(MODES);
    }

    /**
     * Validate if a mode switch is allowed
     * @param {string} fromMode - The source mode
     * @param {string} toMode - The target mode
     * @returns {boolean} - True if switch is valid
     */
    validateModeSwitch(fromMode, toMode) {
        // Check if both modes exist
        if (!MODES[fromMode]) {
            console.warn('[Mode Manager] Invalid source mode:', fromMode);
            return false;
        }
        
        if (!MODES[toMode]) {
            console.warn('[Mode Manager] Invalid target mode:', toMode);
            return false;
        }

        // All mode switches are allowed in this system
        // (Workspace preserves blocks from all modes)
        return true;
    }

    /**
     * Check if a mode exists
     * @param {string} mode - The mode to check
     * @returns {boolean} - True if mode exists
     */
    isValidMode(mode) {
        return MODES.hasOwnProperty(mode);
    }

    /**
     * Get the previous mode
     * @returns {string|null} - Previous mode name or null
     */
    getPreviousMode() {
        return this.previousMode;
    }

    /**
     * Get mode history
     * @returns {Array<string>} - Array of mode names in chronological order
     */
    getModeHistory() {
        return [...this.modeHistory];
    }

    /**
     * Register a listener for mode change events
     * @param {string} event - Event name ('beforeModeChange', 'afterModeChange', 'modeChangeError')
     * @param {Function} callback - Callback function
     * @returns {Function} - Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        this.listeners.get(event).push(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        };
    }

    /**
     * Remove a listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function to remove
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

    /**
     * Clear all listeners for an event
     * @param {string} event - Event name (optional, clears all if not provided)
     */
    clearListeners(event = null) {
        if (event) {
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * Get default file name for a mode
     * @param {string} mode - The mode (optional, uses current mode if not provided)
     * @returns {string} - Default file name
     */
    getDefaultFileName(mode = null) {
        const targetMode = mode || this.currentMode;
        const config = this.getModeConfig(targetMode);
        return config ? config.defaultFile : 'output.txt';
    }

    /**
     * Get file extension for a mode
     * @param {string} mode - The mode (optional, uses current mode if not provided)
     * @returns {string} - File extension
     */
    getFileExtension(mode = null) {
        const targetMode = mode || this.currentMode;
        const config = this.getModeConfig(targetMode);
        return config ? config.fileExtension : 'txt';
    }

    /**
     * Get default imports for a mode
     * @param {string} mode - The mode (optional, uses current mode if not provided)
     * @returns {Array<string>} - Array of import statements
     */
    getDefaultImports(mode = null) {
        const targetMode = mode || this.currentMode;
        const config = this.getModeConfig(targetMode);
        return config ? [...config.imports] : [];
    }

    /**
     * Get theme configuration for a mode
     * @param {string} mode - The mode (optional, uses current mode if not provided)
     * @returns {Object} - Theme configuration
     */
    getTheme(mode = null) {
        const targetMode = mode || this.currentMode;
        const config = this.getModeConfig(targetMode);
        return config ? { ...config.theme } : null;
    }

    // Private helper methods

    /**
     * Apply mode-specific theme to the workspace
     * @private
     */
    _applyModeTheme(mode) {
        const config = this.getModeConfig(mode);
        if (!config) return;

        // Apply theme to workspace if available
        if (this.workspace && this.workspace.options) {
            // Update workspace theme colors
            // Note: Actual implementation depends on Blockly API
            console.log('[Mode Manager] Applying theme for mode:', mode, config.theme);
        }

        // Update UI elements with mode color
        this._updateUITheme(config.theme);
    }

    /**
     * Update UI elements with mode theme
     * @private
     */
    _updateUITheme(theme) {
        // Update mode indicator if it exists
        const modeIndicator = document.getElementById('mode-indicator');
        if (modeIndicator) {
            modeIndicator.style.backgroundColor = theme.primaryColor;
        }

        // Update mode selector if it exists
        const modeSelector = document.getElementById('mode-selector');
        if (modeSelector) {
            modeSelector.style.borderColor = theme.primaryColor;
        }

        // Add mode-specific class to body for CSS styling
        document.body.classList.remove('mode-rust', 'mode-wgsl', 'mode-bevy');
        document.body.classList.add(`mode-${this.currentMode}`);
    }

    /**
     * Update workspace for new mode
     * @private
     */
    _updateWorkspaceForMode(mode) {
        // Workspace preserves all blocks from all modes
        // This method can be used to update mode-specific UI elements
        
        // Update block visibility or styling based on mode if needed
        if (this.workspace) {
            const blocks = this.workspace.getAllBlocks(false);
            blocks.forEach(block => {
                // Blocks from all modes remain visible
                // Could add visual indicators for cross-mode blocks here
                if (block.mode && block.mode !== mode) {
                    // Mark as cross-mode block (optional visual indicator)
                    block.setCrossMode?.(true);
                } else {
                    block.setCrossMode?.(false);
                }
            });
        }
    }

    /**
     * Notify all listeners of an event
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
                console.error('[Mode Manager] Error in event listener:', event, error);
            }
        });
    }

    /**
     * Reset mode manager to default state
     */
    reset() {
        this.currentMode = 'rust';
        this.previousMode = null;
        this.modeHistory = ['rust'];
        this._applyModeTheme('rust');
        console.log('[Mode Manager] Reset to default mode');
    }

    /**
     * Get statistics about mode usage
     * @returns {Object} - Mode usage statistics
     */
    getStatistics() {
        const stats = {
            currentMode: this.currentMode,
            previousMode: this.previousMode,
            totalSwitches: this.modeHistory.length - 1,
            modeUsage: {}
        };

        // Count mode usage
        this.modeHistory.forEach(mode => {
            stats.modeUsage[mode] = (stats.modeUsage[mode] || 0) + 1;
        });

        return stats;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ModeManager, MODES };
}
