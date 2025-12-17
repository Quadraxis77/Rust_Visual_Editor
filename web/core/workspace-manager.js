/**
 * Workspace Manager Module for Blockly Editor
 * 
 * Manages workspace lifecycle including save/load operations, change tracking,
 * and workspace validation.
 * 
 * Requirements: 5.5
 */

class WorkspaceManager {
  /**
   * Creates a new WorkspaceManager instance
   * @param {Blockly.Workspace} workspace - The Blockly workspace to manage
   * @param {Validator} validator - Optional validator instance for workspace validation
   * @param {PerformanceCache} performanceCache - Optional performance cache instance
   */
  constructor(workspace, validator = null, performanceCache = null) {
    if (!workspace) {
      throw new Error('Workspace is required');
    }
    
    this.workspace = workspace;
    this.validator = validator;
    this.performanceCache = performanceCache;
    this.unsavedChanges = false;
    this.lastSavedState = null;
    this.changeListenerId = null;
    
    // Initialize change tracking
    this.initializeChangeTracking();
  }

  /**
   * Initializes change tracking for the workspace
   * @private
   */
  initializeChangeTracking() {
    // Listen for workspace changes
    this.changeListenerId = this.workspace.addChangeListener((event) => {
      // Ignore UI events and events during loading
      if (event.type === Blockly.Events.UI || 
          event.type === Blockly.Events.FINISHED_LOADING) {
        return;
      }
      
      // Mark workspace as having unsaved changes
      this.unsavedChanges = true;
    });
  }

  /**
   * Serializes the workspace to XML string
   * @returns {string} - XML representation of the workspace
   */
  save() {
    try {
      const startTime = performance.now();
      
      // Convert workspace to XML DOM
      const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
      
      // Convert DOM to pretty-printed text
      const xmlText = Blockly.Xml.domToPrettyText(xmlDom);
      
      // Update last saved state
      this.lastSavedState = xmlText;
      this.unsavedChanges = false;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`[WorkspaceManager] Workspace saved in ${duration.toFixed(2)}ms`);
      
      // Check performance target (< 200ms per requirement 5.5)
      if (duration > 200) {
        console.warn(`[WorkspaceManager] Save operation took ${duration.toFixed(2)}ms, exceeding 200ms target`);
      }
      
      return xmlText;
    } catch (error) {
      console.error('[WorkspaceManager] Error saving workspace:', error);
      throw new Error(`Failed to save workspace: ${error.message}`);
    }
  }

  /**
   * Deserializes XML string and loads it into the workspace
   * @param {string} xml - XML string representation of workspace
   * @returns {boolean} - True if load was successful
   */
  load(xml) {
    if (!xml || typeof xml !== 'string') {
      console.error('[WorkspaceManager] Invalid XML provided to load()');
      return false;
    }

    try {
      const startTime = performance.now();
      
      // Parse XML string to DOM
      const xmlDom = Blockly.utils.xml.textToDom(xml);
      
      // Clear existing workspace
      this.workspace.clear();
      
      // Load XML into workspace
      Blockly.Xml.domToWorkspace(xmlDom, this.workspace);
      
      // Update saved state
      this.lastSavedState = xml;
      this.unsavedChanges = false;
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      console.log(`[WorkspaceManager] Workspace loaded in ${duration.toFixed(2)}ms`);
      console.log(`[WorkspaceManager] Loaded ${this.getBlockCount()} blocks`);
      
      return true;
    } catch (error) {
      console.error('[WorkspaceManager] Error loading workspace:', error);
      throw new Error(`Failed to load workspace: ${error.message}`);
    }
  }

  /**
   * Clears the workspace and resets state
   */
  clear() {
    try {
      // Clear the workspace
      this.workspace.clear();
      
      // Reset state
      this.lastSavedState = null;
      this.unsavedChanges = false;
      
      console.log('[WorkspaceManager] Workspace cleared');
    } catch (error) {
      console.error('[WorkspaceManager] Error clearing workspace:', error);
      throw new Error(`Failed to clear workspace: ${error.message}`);
    }
  }

  /**
   * Checks if the workspace has unsaved changes
   * @returns {boolean} - True if there are unsaved changes
   */
  hasUnsavedChanges() {
    return this.unsavedChanges;
  }

  /**
   * Gets the total number of blocks in the workspace
   * @returns {number} - Count of all blocks
   */
  getBlockCount() {
    try {
      const blocks = this.workspace.getAllBlocks(false);
      return blocks.length;
    } catch (error) {
      console.error('[WorkspaceManager] Error counting blocks:', error);
      return 0;
    }
  }

  /**
   * Validates the entire workspace
   * @returns {Object} - Validation result with errors and warnings
   */
  validateWorkspace() {
    // Check performance cache first
    if (this.performanceCache) {
      const cachedResult = this.performanceCache.getCachedValidation(this.workspace);
      if (cachedResult) {
        console.log('[WorkspaceManager] Using cached validation result');
        return cachedResult;
      }
    }
    
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      blockResults: []
    };

    try {
      // Get all blocks in workspace
      const blocks = this.workspace.getAllBlocks(false);
      
      if (blocks.length === 0) {
        result.warnings.push('Workspace is empty');
        
        // Cache empty workspace result
        if (this.performanceCache) {
          this.performanceCache.setCachedValidation(this.workspace, result);
        }
        
        return result;
      }

      console.log(`[WorkspaceManager] Validating ${blocks.length} blocks...`);

      // Validate each block if validator is available
      if (this.validator) {
        for (const block of blocks) {
          const blockResult = this.validator.validateBlock(block);
          
          // Store block-specific result
          result.blockResults.push({
            blockId: block.id,
            blockType: block.type,
            result: blockResult
          });

          // Aggregate errors and warnings
          if (!blockResult.valid) {
            result.valid = false;
            result.errors.push(...blockResult.errors.map(err => 
              `Block ${block.type} (${block.id}): ${err}`
            ));
          }
          
          result.warnings.push(...blockResult.warnings.map(warn => 
            `Block ${block.type} (${block.id}): ${warn}`
          ));
        }
      } else {
        // Basic validation without validator
        for (const block of blocks) {
          // Check for disconnected blocks
          if (!block.getParent() && !block.nextConnection?.targetConnection) {
            result.warnings.push(
              `Block ${block.type} (${block.id}) is disconnected`
            );
          }

          // Check for empty required fields
          const inputList = block.inputList || [];
          for (const input of inputList) {
            if (input.type === Blockly.INPUT_VALUE && 
                !input.connection?.targetConnection) {
              result.warnings.push(
                `Block ${block.type} (${block.id}): Input '${input.name}' is not connected`
              );
            }
          }
        }
      }

      // Summary
      console.log(`[WorkspaceManager] Validation complete: ${result.errors.length} errors, ${result.warnings.length} warnings`);
      
      if (result.errors.length > 0) {
        console.error('[WorkspaceManager] Validation errors:', result.errors);
      }
      
      if (result.warnings.length > 0) {
        console.warn('[WorkspaceManager] Validation warnings:', result.warnings);
      }

    } catch (error) {
      console.error('[WorkspaceManager] Error during validation:', error);
      result.valid = false;
      result.errors.push(`Validation failed: ${error.message}`);
    }

    // Cache validation result
    if (this.performanceCache) {
      this.performanceCache.setCachedValidation(this.workspace, result);
    }

    return result;
  }

  /**
   * Exports workspace to a downloadable XML file
   * @param {string} filename - Optional filename (defaults to blockly_workspace.xml)
   */
  exportToFile(filename = 'blockly_workspace.xml') {
    try {
      const xml = this.save();
      
      const blob = new Blob([xml], { type: 'text/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
      console.log(`[WorkspaceManager] Workspace exported to ${filename}`);
    } catch (error) {
      console.error('[WorkspaceManager] Error exporting workspace:', error);
      throw new Error(`Failed to export workspace: ${error.message}`);
    }
  }

  /**
   * Imports workspace from a file
   * @returns {Promise<boolean>} - Promise that resolves to true if import was successful
   */
  importFromFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xml';
      
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          resolve(false);
          return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
          try {
            const success = this.load(event.target.result);
            resolve(success);
          } catch (error) {
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  /**
   * Gets the current workspace state as XML
   * @returns {string} - Current workspace XML
   */
  getCurrentState() {
    try {
      const xmlDom = Blockly.Xml.workspaceToDom(this.workspace);
      return Blockly.Xml.domToPrettyText(xmlDom);
    } catch (error) {
      console.error('[WorkspaceManager] Error getting current state:', error);
      return null;
    }
  }

  /**
   * Compares current workspace state with last saved state
   * @returns {boolean} - True if workspace has changed since last save
   */
  hasChangedSinceLastSave() {
    if (!this.lastSavedState) {
      return this.getBlockCount() > 0;
    }
    
    const currentState = this.getCurrentState();
    return currentState !== this.lastSavedState;
  }

  /**
   * Marks the workspace as saved (resets unsaved changes flag)
   */
  markAsSaved() {
    this.unsavedChanges = false;
    this.lastSavedState = this.getCurrentState();
  }

  /**
   * Disposes of the workspace manager and cleans up listeners
   */
  dispose() {
    if (this.changeListenerId !== null) {
      this.workspace.removeChangeListener(this.changeListenerId);
      this.changeListenerId = null;
    }
    
    console.log('[WorkspaceManager] Disposed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WorkspaceManager;
}
