/**
 * File Link Visualizer
 * 
 * Draws visual connection lines between file_container blocks and mod_file blocks
 * to show which files are linked together in the project structure.
 */

class FileLinkVisualizer {
    constructor(workspace) {
        this.workspace = workspace;
        this.canvas = null;
        this.ctx = null;
        this.connections = new Map(); // mod_file blockId -> file_container blockId
        this.enabled = true;
        
        this.initCanvas();
        this.setupListeners();
    }

    /**
     * Initialize the canvas overlay for drawing connections
     */
    initCanvas() {
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'file-link-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.canvas.style.zIndex = '1'; // Above workspace, below blocks
        
        // Add to blockly container
        const blocklyDiv = document.getElementById('blocklyDiv');
        if (blocklyDiv) {
            blocklyDiv.style.position = 'relative';
            blocklyDiv.appendChild(this.canvas);
            
            // Set canvas size
            this.resizeCanvas();
        }
        
        this.ctx = this.canvas.getContext('2d');
    }

    /**
     * Resize canvas to match workspace
     */
    resizeCanvas() {
        if (!this.canvas) return;
        
        const blocklyDiv = document.getElementById('blocklyDiv');
        if (blocklyDiv) {
            // Use device pixel ratio for crisp lines on high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            const rect = blocklyDiv.getBoundingClientRect();
            
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            
            // Scale context to match device pixel ratio
            this.ctx = this.canvas.getContext('2d');
            this.ctx.scale(dpr, dpr);
        }
    }

    /**
     * Set up event listeners for workspace changes
     */
    setupListeners() {
        // Redraw on workspace changes
        this.workspace.addChangeListener((event) => {
            // Redraw on block moves, creates, deletes, or changes
            if (event.type === Blockly.Events.BLOCK_MOVE ||
                event.type === Blockly.Events.BLOCK_CREATE ||
                event.type === Blockly.Events.BLOCK_DELETE ||
                event.type === Blockly.Events.BLOCK_CHANGE ||
                event.type === Blockly.Events.VIEWPORT_CHANGE) {
                this.updateConnections();
                this.draw();
            }
        });

        // Redraw on window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.draw();
        });
    }

    /**
     * Update the connections map by scanning workspace
     */
    updateConnections() {
        this.connections.clear();
        
        // Find all mod_file blocks
        const allBlocks = this.workspace.getAllBlocks(false);
        const modFileBlocks = allBlocks.filter(block => 
            block.type === 'rust_mod_file' || block.type === 'bevy_mod_file'
        );
        
        // Find all file_container blocks
        const fileContainers = allBlocks.filter(block => 
            block.type === 'file_container'
        );
        
        // Create a map of filename -> file_container block
        const fileMap = new Map();
        fileContainers.forEach(container => {
            const filename = container.getFieldValue('FILENAME');
            if (filename) {
                // Remove .rs extension for matching
                const baseName = filename.replace(/\.rs$/, '');
                fileMap.set(baseName, container);
            }
        });
        
        // Match mod_file blocks to file_containers
        modFileBlocks.forEach(modBlock => {
            const modName = modBlock.getFieldValue('NAME');
            if (modName && fileMap.has(modName)) {
                this.connections.set(modBlock.id, fileMap.get(modName).id);
            }
        });
    }

    /**
     * Draw all connection lines
     */
    draw() {
        if (!this.ctx || !this.enabled) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get workspace metrics for coordinate conversion
        const metrics = this.workspace.getMetrics();
        const scale = this.workspace.scale;
        
        // Draw each connection
        this.connections.forEach((targetId, sourceId) => {
            const sourceBlock = this.workspace.getBlockById(sourceId);
            const targetBlock = this.workspace.getBlockById(targetId);
            
            if (sourceBlock && targetBlock) {
                this.drawConnection(sourceBlock, targetBlock, scale, metrics);
            }
        });
    }

    /**
     * Draw a single connection line between two blocks
     */
    drawConnection(sourceBlock, targetBlock, scale, metrics) {
        // Get block positions in workspace coordinates
        const sourcePos = sourceBlock.getRelativeToSurfaceXY();
        const targetPos = targetBlock.getRelativeToSurfaceXY();
        
        // Get workspace origin offset
        const origin = this.workspace.getOriginOffsetInPixels();
        
        // Convert to canvas coordinates accounting for scale and viewport
        const sourceX = (sourcePos.x * scale) + origin.x;
        const sourceY = (sourcePos.y * scale) + origin.y;
        const targetX = (targetPos.x * scale) + origin.x;
        const targetY = (targetPos.y * scale) + origin.y;
        
        // Get block dimensions scaled
        const sourceWidth = sourceBlock.width * scale;
        const sourceHeight = sourceBlock.height * scale;
        const targetWidth = targetBlock.width * scale;
        const targetHeight = targetBlock.height * scale;
        
        // Calculate connection points (center-right of source, center-left of target)
        const startX = sourceX + sourceWidth;
        const startY = sourceY + sourceHeight / 2;
        const endX = targetX;
        const endY = targetY + targetHeight / 2;
        
        // Draw curved line
        this.ctx.save();
        
        // Style - scale line width with zoom but keep it reasonable
        this.ctx.strokeStyle = '#4EC9B0'; // Teal color
        this.ctx.lineWidth = Math.max(1.5, Math.min(3, 2 * scale));
        this.ctx.setLineDash([5 * scale, 5 * scale]); // Dashed line scaled
        this.ctx.globalAlpha = 0.6;
        
        // Draw bezier curve
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        
        // Control points for smooth curve - scale with zoom
        const controlOffset = Math.min(Math.abs(endX - startX) / 2, 100 * scale);
        const cp1x = startX + controlOffset;
        const cp1y = startY;
        const cp2x = endX - controlOffset;
        const cp2y = endY;
        
        this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
        this.ctx.stroke();
        
        // Draw arrow at end - scale with zoom
        this.drawArrow(endX, endY, cp2x, cp2y, scale);
        
        // Draw connection dots - scale with zoom
        this.ctx.setLineDash([]); // Solid for dots
        this.ctx.fillStyle = '#4EC9B0';
        const dotRadius = Math.max(3, Math.min(5, 4 * scale));
        this.ctx.beginPath();
        this.ctx.arc(startX, startY, dotRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(endX, endY, dotRadius, 0, 2 * Math.PI);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    /**
     * Draw an arrow head at the end of a line
     */
    drawArrow(x, y, fromX, fromY, scale) {
        const angle = Math.atan2(y - fromY, x - fromX);
        const arrowLength = Math.max(8, Math.min(12, 10 * scale));
        const arrowWidth = Math.max(5, Math.min(8, 6 * scale));
        
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(-arrowLength, -arrowWidth);
        this.ctx.lineTo(-arrowLength, arrowWidth);
        this.ctx.closePath();
        
        this.ctx.fillStyle = '#4EC9B0';
        this.ctx.fill();
        
        this.ctx.restore();
    }

    /**
     * Enable or disable the visualizer
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.updateConnections();
            this.draw();
        }
    }

    /**
     * Toggle visualizer on/off
     */
    toggle() {
        this.setEnabled(!this.enabled);
        return this.enabled;
    }

    /**
     * Highlight a specific connection
     */
    highlightConnection(modBlockId) {
        // TODO: Implement highlighting for specific connections
        // Could be used when hovering over a mod block
    }

    /**
     * Clean up resources
     */
    destroy() {
        if (this.canvas && this.canvas.parentElement) {
            this.canvas.parentElement.removeChild(this.canvas);
        }
    }
}
