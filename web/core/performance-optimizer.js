/**
 * Performance Optimizer Module
 * 
 * Provides performance optimizations for rendering and interactions including:
 * - Throttling for workspace change events
 * - Optimized block rendering for large workspaces
 * - Virtual scrolling for large toolboxes
 * - Optimized cross-mode reference link drawing
 * 
 * Requirements: 5.1, 5.3
 */

class PerformanceOptimizer {
    constructor() {
        // Throttle timers
        this.throttleTimers = new Map();
        
        // Debounce timers
        this.debounceTimers = new Map();
        
        // Request animation frame IDs
        this.rafIds = new Map();
        
        // Performance monitoring
        this.metrics = {
            throttledCalls: 0,
            debouncedCalls: 0,
            rafCalls: 0,
            averageFrameTime: 0,
            frameCount: 0
        };
        
        // Frame time tracking
        this.frameTimes = [];
        this.maxFrameTimeSamples = 60;
        
        console.log('[PerformanceOptimizer] Initialized');
    }
    
    // ========== THROTTLING ==========
    
    /**
     * Throttle a function to execute at most once per specified interval
     * @param {string} key - Unique key for this throttled function
     * @param {Function} fn - Function to throttle
     * @param {number} delay - Minimum delay between executions (ms)
     * @param {Object} options - Options: { leading: boolean, trailing: boolean }
     * @returns {Function} Throttled function
     */
    throttle(key, fn, delay = 100, options = { leading: true, trailing: true }) {
        return (...args) => {
            const now = Date.now();
            const timer = this.throttleTimers.get(key);
            
            if (!timer) {
                // First call
                if (options.leading) {
                    fn.apply(this, args);
                }
                
                this.throttleTimers.set(key, {
                    lastCall: now,
                    timeoutId: null,
                    pendingArgs: null
                });
                
                this.metrics.throttledCalls++;
                return;
            }
            
            const timeSinceLastCall = now - timer.lastCall;
            
            if (timeSinceLastCall >= delay) {
                // Enough time has passed, execute immediately
                fn.apply(this, args);
                timer.lastCall = now;
                timer.pendingArgs = null;
                
                this.metrics.throttledCalls++;
            } else if (options.trailing) {
                // Store args for trailing call
                timer.pendingArgs = args;
                
                // Clear existing timeout
                if (timer.timeoutId) {
                    clearTimeout(timer.timeoutId);
                }
                
                // Schedule trailing call
                timer.timeoutId = setTimeout(() => {
                    if (timer.pendingArgs) {
                        fn.apply(this, timer.pendingArgs);
                        timer.lastCall = Date.now();
                        timer.pendingArgs = null;
                        
                        this.metrics.throttledCalls++;
                    }
                }, delay - timeSinceLastCall);
            }
        };
    }
    
    /**
     * Clear throttle timer for a specific key
     * @param {string} key - Throttle key to clear
     */
    clearThrottle(key) {
        const timer = this.throttleTimers.get(key);
        if (timer && timer.timeoutId) {
            clearTimeout(timer.timeoutId);
        }
        this.throttleTimers.delete(key);
    }
    
    /**
     * Clear all throttle timers
     */
    clearAllThrottles() {
        this.throttleTimers.forEach((timer, key) => {
            if (timer.timeoutId) {
                clearTimeout(timer.timeoutId);
            }
        });
        this.throttleTimers.clear();
    }
    
    // ========== DEBOUNCING ==========
    
    /**
     * Debounce a function to execute only after it stops being called for specified delay
     * @param {string} key - Unique key for this debounced function
     * @param {Function} fn - Function to debounce
     * @param {number} delay - Delay to wait after last call (ms)
     * @param {Object} options - Options: { leading: boolean, maxWait: number }
     * @returns {Function} Debounced function
     */
    debounce(key, fn, delay = 300, options = { leading: false, maxWait: null }) {
        return (...args) => {
            const timer = this.debounceTimers.get(key);
            const now = Date.now();
            
            // Clear existing timeout
            if (timer && timer.timeoutId) {
                clearTimeout(timer.timeoutId);
            }
            
            // Check if we should execute immediately (leading edge)
            if (options.leading && (!timer || !timer.hasCalled)) {
                fn.apply(this, args);
                this.debounceTimers.set(key, {
                    timeoutId: null,
                    firstCall: now,
                    hasCalled: true
                });
                this.metrics.debouncedCalls++;
                return;
            }
            
            // Check maxWait
            const firstCall = timer ? timer.firstCall : now;
            const timeSinceFirst = now - firstCall;
            
            if (options.maxWait && timeSinceFirst >= options.maxWait) {
                // Max wait exceeded, execute immediately
                fn.apply(this, args);
                this.debounceTimers.set(key, {
                    timeoutId: null,
                    firstCall: now,
                    hasCalled: true
                });
                this.metrics.debouncedCalls++;
                return;
            }
            
            // Schedule execution
            const timeoutId = setTimeout(() => {
                fn.apply(this, args);
                this.debounceTimers.delete(key);
                this.metrics.debouncedCalls++;
            }, delay);
            
            this.debounceTimers.set(key, {
                timeoutId,
                firstCall: timer ? timer.firstCall : now,
                hasCalled: timer ? timer.hasCalled : false
            });
        };
    }
    
    /**
     * Clear debounce timer for a specific key
     * @param {string} key - Debounce key to clear
     */
    clearDebounce(key) {
        const timer = this.debounceTimers.get(key);
        if (timer && timer.timeoutId) {
            clearTimeout(timer.timeoutId);
        }
        this.debounceTimers.delete(key);
    }
    
    /**
     * Clear all debounce timers
     */
    clearAllDebounces() {
        this.debounceTimers.forEach((timer, key) => {
            if (timer.timeoutId) {
                clearTimeout(timer.timeoutId);
            }
        });
        this.debounceTimers.clear();
    }
    
    // ========== REQUEST ANIMATION FRAME ==========
    
    /**
     * Schedule a function to run on next animation frame
     * Automatically cancels previous scheduled call with same key
     * @param {string} key - Unique key for this RAF call
     * @param {Function} fn - Function to execute
     * @returns {number} RAF ID
     */
    scheduleRAF(key, fn) {
        // Cancel existing RAF for this key
        this.cancelRAF(key);
        
        const rafId = requestAnimationFrame((timestamp) => {
            const startTime = performance.now();
            
            fn(timestamp);
            
            const endTime = performance.now();
            const frameTime = endTime - startTime;
            
            // Track frame time
            this.frameTimes.push(frameTime);
            if (this.frameTimes.length > this.maxFrameTimeSamples) {
                this.frameTimes.shift();
            }
            
            // Update metrics
            this.metrics.rafCalls++;
            this.metrics.frameCount++;
            this.metrics.averageFrameTime = 
                this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
            
            // Remove from active RAFs
            this.rafIds.delete(key);
        });
        
        this.rafIds.set(key, rafId);
        return rafId;
    }
    
    /**
     * Cancel a scheduled RAF call
     * @param {string} key - RAF key to cancel
     */
    cancelRAF(key) {
        const rafId = this.rafIds.get(key);
        if (rafId !== undefined) {
            cancelAnimationFrame(rafId);
            this.rafIds.delete(key);
        }
    }
    
    /**
     * Cancel all scheduled RAF calls
     */
    cancelAllRAFs() {
        this.rafIds.forEach((rafId, key) => {
            cancelAnimationFrame(rafId);
        });
        this.rafIds.clear();
    }
    
    // ========== BATCH UPDATES ==========
    
    /**
     * Batch multiple DOM updates into a single RAF
     * @param {string} key - Unique key for this batch
     * @param {Function} updateFn - Function containing DOM updates
     */
    batchDOMUpdates(key, updateFn) {
        this.scheduleRAF(key, () => {
            // Read phase (if needed)
            // ... measurements ...
            
            // Write phase
            updateFn();
        });
    }
    
    // ========== VIRTUAL SCROLLING ==========
    
    /**
     * Create a virtual scrolling container for large lists
     * @param {HTMLElement} container - Container element
     * @param {Array} items - Array of items to render
     * @param {Function} renderItem - Function to render a single item
     * @param {Object} options - Options: { itemHeight, overscan, onScroll }
     * @returns {Object} Virtual scroll controller
     */
    createVirtualScroll(container, items, renderItem, options = {}) {
        const {
            itemHeight = 40,
            overscan = 3,
            onScroll = null
        } = options;
        
        const state = {
            scrollTop: 0,
            visibleStart: 0,
            visibleEnd: 0,
            renderedItems: new Map()
        };
        
        // Create scroll container
        const scrollContainer = document.createElement('div');
        scrollContainer.style.height = `${items.length * itemHeight}px`;
        scrollContainer.style.position = 'relative';
        
        // Create viewport
        const viewport = document.createElement('div');
        viewport.style.position = 'absolute';
        viewport.style.top = '0';
        viewport.style.left = '0';
        viewport.style.right = '0';
        
        scrollContainer.appendChild(viewport);
        container.appendChild(scrollContainer);
        
        // Update visible items
        const updateVisibleItems = () => {
            const containerHeight = container.clientHeight;
            const scrollTop = container.scrollTop;
            
            const visibleStart = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
            const visibleEnd = Math.min(
                items.length,
                Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
            );
            
            state.scrollTop = scrollTop;
            state.visibleStart = visibleStart;
            state.visibleEnd = visibleEnd;
            
            // Remove items outside visible range
            state.renderedItems.forEach((element, index) => {
                if (index < visibleStart || index >= visibleEnd) {
                    element.remove();
                    state.renderedItems.delete(index);
                }
            });
            
            // Add items in visible range
            for (let i = visibleStart; i < visibleEnd; i++) {
                if (!state.renderedItems.has(i)) {
                    const element = renderItem(items[i], i);
                    element.style.position = 'absolute';
                    element.style.top = `${i * itemHeight}px`;
                    element.style.left = '0';
                    element.style.right = '0';
                    element.style.height = `${itemHeight}px`;
                    
                    viewport.appendChild(element);
                    state.renderedItems.set(i, element);
                }
            }
            
            if (onScroll) {
                onScroll(state);
            }
        };
        
        // Throttled scroll handler
        const handleScroll = this.throttle('virtualScroll', updateVisibleItems, 16); // ~60fps
        container.addEventListener('scroll', handleScroll);
        
        // Initial render
        updateVisibleItems();
        
        // Return controller
        return {
            update: (newItems) => {
                items = newItems;
                scrollContainer.style.height = `${items.length * itemHeight}px`;
                state.renderedItems.clear();
                viewport.innerHTML = '';
                updateVisibleItems();
            },
            scrollToIndex: (index) => {
                container.scrollTop = index * itemHeight;
            },
            destroy: () => {
                container.removeEventListener('scroll', handleScroll);
                this.clearThrottle('virtualScroll');
                scrollContainer.remove();
            },
            getState: () => ({ ...state })
        };
    }
    
    // ========== OPTIMIZED RENDERING ==========
    
    /**
     * Optimize rendering for large workspaces
     * @param {Blockly.Workspace} workspace - Workspace to optimize
     * @param {Object} options - Optimization options
     */
    optimizeWorkspaceRendering(workspace, options = {}) {
        const {
            enableBlockCulling = true,
            enableConnectionCulling = true,
            maxVisibleBlocks = 200
        } = options;
        
        if (!workspace) {
            console.warn('[PerformanceOptimizer] No workspace provided');
            return;
        }
        
        // Get all blocks
        const allBlocks = workspace.getAllBlocks(false);
        
        if (allBlocks.length <= maxVisibleBlocks) {
            // Workspace is small enough, no optimization needed
            return;
        }
        
        console.log(`[PerformanceOptimizer] Optimizing rendering for ${allBlocks.length} blocks`);
        
        // Implement block culling (hide blocks outside viewport)
        if (enableBlockCulling) {
            this._cullBlocks(workspace, allBlocks);
        }
        
        // Implement connection culling (hide connection indicators)
        if (enableConnectionCulling) {
            this._cullConnections(workspace, allBlocks);
        }
    }
    
    /**
     * Cull blocks outside viewport
     * @private
     */
    _cullBlocks(workspace, blocks) {
        // Get workspace metrics
        const metrics = workspace.getMetrics();
        if (!metrics) return;
        
        const viewportBounds = {
            left: metrics.viewLeft,
            right: metrics.viewLeft + metrics.viewWidth,
            top: metrics.viewTop,
            bottom: metrics.viewTop + metrics.viewHeight
        };
        
        // Add padding for smooth scrolling
        const padding = 100;
        viewportBounds.left -= padding;
        viewportBounds.right += padding;
        viewportBounds.top -= padding;
        viewportBounds.bottom += padding;
        
        // Check each block
        blocks.forEach(block => {
            const bounds = block.getBoundingRectangle();
            if (!bounds) return;
            
            const isVisible = !(
                bounds.right < viewportBounds.left ||
                bounds.left > viewportBounds.right ||
                bounds.bottom < viewportBounds.top ||
                bounds.top > viewportBounds.bottom
            );
            
            // Toggle visibility
            if (block.getSvgRoot()) {
                block.getSvgRoot().style.display = isVisible ? '' : 'none';
            }
        });
    }
    
    /**
     * Cull connection indicators outside viewport
     * @private
     */
    _cullConnections(workspace, blocks) {
        // This is a placeholder - actual implementation would depend on
        // Blockly's internal connection rendering system
        console.log('[PerformanceOptimizer] Connection culling not yet implemented');
    }
    
    /**
     * Optimize cross-mode reference link drawing
     * @param {Array} references - Array of reference objects
     * @param {Function} drawFn - Function to draw a single reference
     */
    optimizeReferenceLinkDrawing(references, drawFn) {
        if (!references || references.length === 0) {
            return;
        }
        
        console.log(`[PerformanceOptimizer] Optimizing ${references.length} reference links`);
        
        // Batch drawing into single RAF
        this.scheduleRAF('referenceLinks', () => {
            // Use document fragment for batch DOM insertion
            const fragment = document.createDocumentFragment();
            
            references.forEach(ref => {
                const element = drawFn(ref);
                if (element) {
                    fragment.appendChild(element);
                }
            });
            
            // Single DOM insertion
            const container = document.getElementById('referenceLinksContainer');
            if (container) {
                container.innerHTML = '';
                container.appendChild(fragment);
            }
        });
    }
    
    // ========== METRICS ==========
    
    /**
     * Get performance metrics
     * @returns {Object} Performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeThrottles: this.throttleTimers.size,
            activeDebounces: this.debounceTimers.size,
            activeRAFs: this.rafIds.size,
            averageFPS: this.metrics.averageFrameTime > 0 
                ? Math.round(1000 / this.metrics.averageFrameTime) 
                : 0
        };
    }
    
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            throttledCalls: 0,
            debouncedCalls: 0,
            rafCalls: 0,
            averageFrameTime: 0,
            frameCount: 0
        };
        this.frameTimes = [];
        console.log('[PerformanceOptimizer] Metrics reset');
    }
    
    /**
     * Log metrics to console
     */
    logMetrics() {
        const metrics = this.getMetrics();
        console.log('[PerformanceOptimizer] Metrics:', metrics);
    }
    
    /**
     * Clean up all timers and RAF calls
     */
    dispose() {
        this.clearAllThrottles();
        this.clearAllDebounces();
        this.cancelAllRAFs();
        console.log('[PerformanceOptimizer] Disposed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}
