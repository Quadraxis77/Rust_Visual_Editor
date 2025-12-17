/**
 * Error Handler Module
 * 
 * Manages error display, logging, and recovery suggestions for the Blockly editor.
 * Provides user-friendly error messages and detailed debugging information.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.5
 */

class ErrorHandler {
    constructor() {
        this.errorHistory = [];
        this.maxHistorySize = 100;
        this.errorPanel = null;
        this.currentErrors = new Map(); // blockId -> error
        
        // Initialize error panel
        this.initializeErrorPanel();
    }

    /**
     * Initialize the error display panel in the UI
     * @private
     */
    initializeErrorPanel() {
        // We no longer use the error panel - errors are shown as notifications
        // Keep this method for backwards compatibility but don't create the panel
        this.errorPanel = null;
    }

    /**
     * Display a user-facing error message
     * @param {Error|string} error - The error to display
     * @param {Object} context - Additional context about the error
     * @param {string} context.blockId - ID of the block causing the error
     * @param {string} context.blockType - Type of the block
     * @param {string} context.field - Field name if applicable
     * @param {string} context.suggestion - Suggested fix
     * @param {string} context.mode - Current editor mode
     * @param {boolean} context.showNotification - If true, show notification immediately
     */
    showError(error, context = {}) {
        const errorObj = this._normalizeError(error, context);
        
        // Store in current errors
        if (context.blockId) {
            this.currentErrors.set(context.blockId, errorObj);
        }
        
        // Add to history
        this._addToHistory(errorObj);
        
        // Log to console for debugging
        this.logError(errorObj, 'error');
        
        // Only show notification if explicitly requested (for non-block errors)
        // Block errors will show notification when user clicks warning icon
        if (context.showNotification && !context.blockId) {
            if (typeof showErrorNotification === 'function') {
                const suggestions = this.suggestFix(errorObj);
                showErrorNotification(errorObj.message, {
                    context: errorObj.context,
                    stack: errorObj.stack,
                    suggestions: suggestions
                });
            } else if (typeof showNotification === 'function') {
                showNotification(errorObj.message, 'error', 8000);
            }
        }
        
        // Update UI
        this._updateErrorPanel();
        
        // Highlight problematic block if blockId provided (shows warning icon)
        if (context.blockId) {
            this._highlightBlock(context.blockId);
        }
        
        // Show tooltip if field specified
        if (context.blockId && context.field) {
            this._showFieldTooltip(context.blockId, context.field, errorObj.message);
        }
    }

    /**
     * Log an error for debugging purposes
     * @param {Error|string} error - The error to log
     * @param {string} level - Log level: 'warn', 'error', or 'fatal'
     */
    logError(error, level = 'error') {
        const errorObj = this._normalizeError(error);
        const timestamp = new Date().toISOString();
        
        // Add to history
        this._addToHistory({ ...errorObj, level, timestamp });
    }

    /**
     * Clear all current errors
     */
    clearErrors() {
        this.currentErrors.clear();
        
        // Clear block highlights
        this._clearAllHighlights();
        
        // No need to hide error panel - we use notifications now
    }

    /**
     * Get the complete error history
     * @returns {Array} Array of error objects with timestamps
     */
    getErrorHistory() {
        return [...this.errorHistory];
    }

    /**
     * Suggest fixes for a given error
     * @param {Error|Object} error - The error to analyze
     * @returns {string[]} Array of suggested fixes
     */
    suggestFix(error) {
        const errorObj = this._normalizeError(error);
        const suggestions = [];
        
        // Type-specific suggestions
        switch (errorObj.type) {
            case 'type_mismatch':
                suggestions.push('Check that the connected blocks have compatible types');
                suggestions.push('Verify the output type matches the expected input type');
                if (errorObj.context?.expectedType && errorObj.context?.actualType) {
                    suggestions.push(`Expected type: ${errorObj.context.expectedType}, but got: ${errorObj.context.actualType}`);
                }
                break;
                
            case 'missing_field':
                suggestions.push('Fill in all required fields before generating code');
                suggestions.push('Check for empty input fields highlighted in red');
                if (errorObj.context?.field) {
                    suggestions.push(`The field "${errorObj.context.field}" is required`);
                }
                break;
                
            case 'invalid_connection':
                suggestions.push('Ensure blocks are connected properly');
                suggestions.push('Check that the connection types are compatible');
                suggestions.push('Try disconnecting and reconnecting the blocks');
                break;
                
            case 'missing_generator':
                suggestions.push('This block may not be fully implemented yet');
                suggestions.push('Try using a different block with similar functionality');
                if (errorObj.context?.blockType) {
                    suggestions.push(`Missing generator for block type: ${errorObj.context.blockType}`);
                }
                break;
                
            case 'syntax_error':
                suggestions.push('Check the generated code for syntax errors');
                suggestions.push('Verify all block fields contain valid values');
                suggestions.push('Try simplifying your block structure');
                break;
                
            case 'validation_error':
                suggestions.push('Check that all constraints are satisfied');
                suggestions.push('Verify numeric values are within valid ranges');
                suggestions.push('Ensure required fields are not empty');
                break;
                
            case 'template_error':
                suggestions.push('The code template may be invalid');
                suggestions.push('Check that all placeholders have corresponding values');
                suggestions.push('Report this issue if it persists');
                break;
                
            case 'mode_error':
                suggestions.push('Verify you are in the correct editor mode');
                suggestions.push('Some blocks are only available in specific modes');
                suggestions.push('Try switching to the appropriate mode');
                break;
                
            case 'reference_error':
                suggestions.push('Check that the referenced file or block exists');
                suggestions.push('Verify cross-mode references are properly configured');
                suggestions.push('Ensure the target file has not been renamed or deleted');
                break;
                
            case 'performance_error':
                suggestions.push('Try reducing the number of blocks in your workspace');
                suggestions.push('Consider breaking your program into smaller files');
                suggestions.push('Close unused categories in the toolbox');
                break;
                
            default:
                suggestions.push('Try reloading the page');
                suggestions.push('Check the browser console for more details');
                suggestions.push('Report this issue if it continues to occur');
        }
        
        // Add custom suggestion from context if provided
        if (errorObj.context?.suggestion) {
            suggestions.unshift(errorObj.context.suggestion);
        }
        
        return suggestions;
    }

    /**
     * Clear a specific error for a block
     * @param {string} blockId - The block ID to clear errors for
     */
    clearBlockError(blockId) {
        if (this.currentErrors.has(blockId)) {
            this.currentErrors.delete(blockId);
            this._clearBlockHighlight(blockId);
            this._updateErrorPanel();
            
            // Close any open notifications for this block
            this._closeNotificationForBlock(blockId);
        }
    }
    
    /**
     * Close notification for a specific block
     * @private
     */
    _closeNotificationForBlock(blockId) {
        // Find and remove notifications for this block
        const notifications = document.querySelectorAll('.notification[data-block-id="' + blockId + '"]');
        notifications.forEach(notification => {
            // Use the global closeNotification function if available
            if (typeof closeNotification === 'function') {
                closeNotification(notification);
            } else {
                // Fallback to manual close
                notification.classList.remove('notification-show');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        });
    }

    /**
     * Check if there are any current errors
     * @returns {boolean} True if there are errors
     */
    hasErrors() {
        return this.currentErrors.size > 0;
    }

    /**
     * Get all current errors
     * @returns {Array} Array of current error objects
     */
    getCurrentErrors() {
        return Array.from(this.currentErrors.values());
    }

    // Private helper methods

    /**
     * Normalize error into consistent format
     * @private
     */
    _normalizeError(error, context = {}) {
        if (typeof error === 'string') {
            return {
                message: error,
                type: context.type || 'unknown',
                stack: new Error().stack,
                context: context
            };
        }
        
        if (error instanceof Error) {
            return {
                message: error.message,
                type: error.type || context.type || 'unknown',
                stack: error.stack,
                context: { ...error.context, ...context }
            };
        }
        
        if (typeof error === 'object') {
            return {
                message: error.message || 'Unknown error',
                type: error.type || context.type || 'unknown',
                stack: error.stack || new Error().stack,
                context: { ...error.context, ...context }
            };
        }
        
        return {
            message: String(error),
            type: 'unknown',
            stack: new Error().stack,
            context: context
        };
    }

    /**
     * Add error to history with size limit
     * @private
     */
    _addToHistory(errorObj) {
        this.errorHistory.push({
            ...errorObj,
            timestamp: errorObj.timestamp || new Date().toISOString()
        });
        
        // Maintain max history size
        if (this.errorHistory.length > this.maxHistorySize) {
            this.errorHistory.shift();
        }
    }

    /**
     * Update the error panel UI - now just sets warning icons on blocks
     * @private
     */
    _updateErrorPanel() {
        // Don't show notifications automatically - only show warning icons
        // Notifications will be shown when user clicks the warning icon
        if (this.errorPanel) {
            this.errorPanel.classList.add('hidden');
        }
    }

    /**
     * Highlight a block with an error
     * @private
     */
    _highlightBlock(blockId) {
        // This would integrate with Blockly's workspace
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const block = workspace.getBlockById(blockId);
            if (block) {
                const error = this.currentErrors.get(blockId);
                const warningText = error ? error.message : 'Click to see details';
                
                // Set warning text - this creates the warning icon
                // Use null as second parameter to prevent bubble from showing
                block.setWarningText(warningText, blockId);
                
                // Store reference to error handler
                const self = this;
                
                // Wait for the warning icon to be created in the DOM
                const setupWarningIcon = () => {
                    const blockSvg = block.getSvgRoot();
                    if (!blockSvg) {
                        return false;
                    }
                    
                    // Look for the warning icon group - this is what Blockly creates
                    const warningIcon = blockSvg.querySelector('.blocklyIconGroup.blocklyWarningIcon, .blocklyIconGroup');
                    
                    if (!warningIcon) {
                        return false;
                    }
                    
                    // Store the handler so we can remove it later
                    const clickHandler = function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        
                        // Show notification (will toggle if already exists)
                        self._showErrorNotificationForBlock(blockId);
                        
                        return false;
                    };
                    
                    // Remove any existing handlers
                    const oldHandler = warningIcon._errorClickHandler;
                    if (oldHandler) {
                        warningIcon.removeEventListener('mousedown', oldHandler, true);
                        warningIcon.removeEventListener('click', oldHandler, true);
                    }
                    
                    // Add new handlers
                    warningIcon.addEventListener('mousedown', clickHandler, true);
                    warningIcon.addEventListener('click', clickHandler, true);
                    warningIcon._errorClickHandler = clickHandler;
                    
                    warningIcon.style.cursor = 'pointer';
                    
                    return true;
                };
                
                // Try immediately
                if (!setupWarningIcon()) {
                    // If not ready, poll for it
                    let attempts = 0;
                    const checkInterval = setInterval(() => {
                        attempts++;
                        if (setupWarningIcon() || attempts > 20) {
                            clearInterval(checkInterval);
                        }
                    }, 50);
                }
                
                // Disable Blockly's bubble by overriding the warning object's setVisible
                const disableBubble = () => {
                    if (block.warning && block.warning.setVisible) {
                        const originalSetVisible = block.warning.setVisible;
                        block.warning.setVisible = function(visible) {
                            // Never show the bubble
                            if (visible) {
                                return;
                            }
                            // Allow hiding
                            originalSetVisible.call(this, false);
                        };
                        
                        // Also disable the bubble's createBubble method
                        if (block.warning.bubble_) {
                            block.warning.bubble_.setVisible(false);
                        }
                        
                        return true;
                    }
                    return false;
                };
                
                // Try to disable bubble immediately
                if (!disableBubble()) {
                    // If warning object not ready, wait for it
                    setTimeout(() => disableBubble(), 100);
                }
            }
        }
    }
    
    /**
     * Show error notification for a specific block when warning icon is clicked
     * @private
     */
    _showErrorNotificationForBlock(blockId) {
        const error = this.currentErrors.get(blockId);
        if (!error) {
            return;
        }
        
        // Check if notification already exists for this block
        const existingNotification = document.querySelector(`.notification[data-block-id="${blockId}"]`);
        if (existingNotification) {
            // Close existing notification - toggle behavior
            if (typeof closeNotification === 'function') {
                closeNotification(existingNotification);
            } else {
                existingNotification.remove();
            }
            return;
        }
        
        const suggestions = this.suggestFix(error);
        
        // Use notification system if available
        let notification = null;
        if (typeof showErrorNotification === 'function') {
            notification = showErrorNotification(error.message, {
                context: {
                    type: error.type,
                    blockId: blockId,
                    blockType: error.context?.blockType,
                    field: error.context?.field
                },
                suggestions: suggestions
            }, 0); // 0 = persistent (won't auto-close)
        } else if (typeof showNotification === 'function') {
            const suggestionText = suggestions.length > 0 
                ? '\n\nSuggestions:\n' + suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
                : '';
            notification = showNotification(error.message + suggestionText, 'error', 0); // 0 = persistent
        }
        
        // Tag the notification with the block ID so we can close it later
        if (notification) {
            notification.dataset.blockId = blockId;
        }
        
        // Also center on the block
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            workspace.centerOnBlock(blockId);
        }
    }

    /**
     * Clear highlight from a specific block
     * @private
     */
    _clearBlockHighlight(blockId) {
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const block = workspace.getBlockById(blockId);
            if (block) {
                block.setWarningText(null);
                
                // Restore original color based on block type
                // Get the original color from block definition
                const blockDef = Blockly.Blocks[block.type];
                if (blockDef && blockDef.colour !== undefined) {
                    block.setColour(blockDef.colour);
                } else {
                    // Default color based on mode
                    const mode = block.mode || 'rust';
                    const modeColors = {
                        rust: 230,
                        wgsl: 270,
                        bevy: 160,
                        biospheres: 180
                    };
                    block.setColour(modeColors[mode] || 230);
                }
            }
        }
    }

    /**
     * Clear all block highlights
     * @private
     */
    _clearAllHighlights() {
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const blocks = workspace.getAllBlocks(false);
            blocks.forEach(block => {
                block.setWarningText(null);
            });
        }
    }

    /**
     * Show tooltip on a specific field
     * @private
     */
    _showFieldTooltip(blockId, fieldName, message) {
        // This would integrate with Blockly's tooltip system
        // Implementation depends on Blockly API
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const block = workspace.getBlockById(blockId);
            if (block) {
                const field = block.getField(fieldName);
                if (field) {
                    // Set tooltip on the field
                    field.setTooltip(message);
                    
                    // Add error styling to the field
                    const fieldElement = field.getSvgRoot();
                    if (fieldElement) {
                        fieldElement.classList.add('blockly-field-error');
                    }
                }
            }
        }
    }

    /**
     * Make error panel items clickable to highlight blocks
     * @private
     */
    _makeErrorItemClickable(blockId) {
        // Wait for next tick to ensure DOM is updated
        setTimeout(() => {
            const errorItem = document.querySelector(`.error-item[data-block-id="${blockId}"]`);
            if (errorItem && !errorItem.dataset.clickHandlerAdded) {
                errorItem.style.cursor = 'pointer';
                errorItem.dataset.clickHandlerAdded = 'true';
                
                errorItem.addEventListener('click', () => {
                    if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
                        const workspace = Blockly.getMainWorkspace();
                        const block = workspace.getBlockById(blockId);
                        if (block) {
                            // Center the block in the workspace
                            workspace.centerOnBlock(blockId);
                            
                            // Select the block
                            block.select();
                            
                            // Flash the block for visual feedback
                            this._flashBlock(blockId);
                        }
                    }
                });
            }
        }, 0);
    }

    /**
     * Flash a block for visual feedback
     * @private
     */
    _flashBlock(blockId) {
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const block = workspace.getBlockById(blockId);
            if (block) {
                const originalColour = block.getColour();
                let flashCount = 0;
                const maxFlashes = 3;
                
                const flashInterval = setInterval(() => {
                    if (flashCount >= maxFlashes * 2) {
                        clearInterval(flashInterval);
                        block.setColour(originalColour);
                        return;
                    }
                    
                    // Alternate between error color and original color
                    if (flashCount % 2 === 0) {
                        block.setColour('#ff6b6b');
                    } else {
                        block.setColour(originalColour);
                    }
                    
                    flashCount++;
                }, 200);
            }
        }
    }

    /**
     * Show tooltip for invalid connection attempt
     * @param {Object} connection - The connection being attempted
     * @param {string} reason - Reason why connection is invalid
     */
    showConnectionTooltip(connection, reason) {
        if (!connection) return;
        
        // Create a temporary tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'connection-error-tooltip';
        tooltip.textContent = reason;
        tooltip.style.cssText = `
            position: fixed;
            background: #e74c3c;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(tooltip);
        
        // Position near the connection
        if (connection.sourceBlock_) {
            const blockSvg = connection.sourceBlock_.getSvgRoot();
            if (blockSvg) {
                const rect = blockSvg.getBoundingClientRect();
                tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
            }
        }
        
        // Remove tooltip after 3 seconds
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }

    /**
     * Validate and show warnings for disconnected blocks
     * @param {Object} workspace - The Blockly workspace
     */
    validateDisconnectedBlocks(workspace) {
        if (!workspace) return;
        
        const blocks = workspace.getAllBlocks(false);
        const disconnectedBlocks = [];
        
        blocks.forEach(block => {
            // Check if block has required inputs that are not connected
            if (block.inputList) {
                for (const input of block.inputList) {
                    if (input.type === Blockly.INPUT_VALUE && 
                        !input.connection?.targetConnection) {
                        
                        // Check if this input is required (not optional)
                        const isRequired = !input.name?.toLowerCase().includes('optional');
                        
                        if (isRequired) {
                            disconnectedBlocks.push({
                                blockId: block.id,
                                blockType: block.type,
                                inputName: input.name
                            });
                        }
                    }
                }
            }
        });
        
        // Show warnings for disconnected blocks
        if (disconnectedBlocks.length > 0) {
            disconnectedBlocks.forEach(({ blockId, blockType, inputName }) => {
                this.showError(
                    `Block "${blockType}" has disconnected required input: ${inputName}`,
                    {
                        blockId,
                        type: 'disconnected_input',
                        field: inputName,
                        suggestion: `Connect a block to the "${inputName}" input`
                    }
                );
            });
        }
        
        return disconnectedBlocks;
    }

    /**
     * Clear field error styling
     * @param {string} blockId - The block ID
     * @param {string} fieldName - The field name
     */
    clearFieldError(blockId, fieldName) {
        if (typeof Blockly !== 'undefined' && Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            const block = workspace.getBlockById(blockId);
            if (block) {
                const field = block.getField(fieldName);
                if (field) {
                    // Remove error styling from the field
                    const fieldElement = field.getSvgRoot();
                    if (fieldElement) {
                        fieldElement.classList.remove('blockly-field-error');
                    }
                    
                    // Reset tooltip
                    field.setTooltip('');
                }
            }
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @private
     */
    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}
