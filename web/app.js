/**
 * Main Application Logic - Refactored Architecture
 * 
 * Integrates all core modules for the three-mode Blockly system:
 * - ModeManager: Handles switching between Rust, WGSL, Bevy
 * - WorkspaceManager: Manages workspace lifecycle (save/load)
 * - ToolboxManager: Dynamic toolbox loading with lazy loading
 * - MultiFileGenerator: Generates code for multiple files
 * - ReferenceManager: Manages cross-mode references
 * - ErrorHandler: Displays errors and provides recovery suggestions
 * - Validator: Validates blocks and connections
 * 
 * Requirements: 2.1, 2.4, 5.2, 14.1, 14.4
 */

// ========== GLOBAL STATE ==========

// Debug mode - set to false to disable console logging
const DEBUG_MODE = true;

// Override console methods if debug mode is off
if (!DEBUG_MODE) {
    const noop = () => {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
}

let workspace;
let modeManager;
let workspaceManager;
let toolboxManager;
let multiFileGenerator;
let referenceManager;
let errorHandler;
let validator;
let namingValidator;
let performanceCache;
let performanceOptimizer;
let tabbedCodeDisplay;
let rustCompiler; // Rust compiler client
let crossModeValidator; // Cross-mode type and alignment validator
let fileLinkVisualizer; // Visual connection lines between linked files

// Current state
let currentMode = 'rust';
let currentFiles = new Map(); // filename -> code
let activeTab = null; // Currently displayed code tab

// Debounce timers
let codeGenerationTimer = null;
let validationTimer = null;

// Debounce delays (in milliseconds)
const CODE_GENERATION_DELAY = 300;  // Requirement 5.2
const VALIDATION_DELAY = 150;       // Requirement 5.2

// ========== INITIALIZATION ==========

/**
 * Initialize the Blockly workspace and all managers
 */
async function initWorkspace() {
    if (DEBUG_MODE) console.log('[App] Initializing workspace...');
    
    try {
        // Initialize performance cache first
        performanceCache = new PerformanceCache();
        window.performanceCache = performanceCache; // Make globally accessible
        
        // Initialize performance optimizer
        performanceOptimizer = new PerformanceOptimizer();
        window.performanceOptimizer = performanceOptimizer; // Make globally accessible
        
        // Initialize error handler (so we can report errors during init)
        errorHandler = new ErrorHandler();
        window.errorHandler = errorHandler; // Make globally accessible
        
        // Initialize naming validator (Requirements 7.1, 7.2, 7.3, 7.4, 7.5)
        namingValidator = new NamingValidator();
        window.namingValidator = namingValidator; // Make globally accessible
        
        // Initialize validator with error handler
        validator = new Validator(errorHandler);
        
        // Initialize cross-mode validator
        crossModeValidator = new CrossModeValidator();
        window.crossModeValidator = crossModeValidator; // Make globally accessible
        
        // Get the Blockly div
        const blocklyDiv = document.getElementById('blocklyDiv');
        if (!blocklyDiv) {
            throw new Error('Blockly div not found');
        }
        
        // Create Blockly workspace with a minimal toolbox
        // We'll update it immediately after with the real toolbox
        workspace = Blockly.inject(blocklyDiv, {
            toolbox: {
                kind: 'categoryToolbox',
                contents: []
            },
            grid: {
                spacing: 20,
                length: 3,
                colour: '#3e3e42',
                snap: true
            },
            zoom: {
                controls: true,
                wheel: true,
                startScale: 1.0,
                maxScale: 3,
                minScale: 0.3,
                scaleSpeed: 1.2
            },
            trashcan: true,
            theme: createBiospheresTheme(),
            comments: false,
            disable: false
        });
        
        console.log('[App] Blockly workspace created');
        
        // Initialize toolbox manager with performance cache
        toolboxManager = new ToolboxManager(workspace, performanceCache);
        console.log('[App] Toolbox Manager initialized');
        
        // Initialize mode manager
        modeManager = new ModeManager(workspace, toolboxManager);
        console.log('[App] Mode Manager initialized');
        
        // Initialize workspace manager with performance cache
        workspaceManager = new WorkspaceManager(workspace, validator, performanceCache);
        console.log('[App] Workspace Manager initialized');
        
        // Initialize generators map
        const generators = new Map();
        if (typeof RustGenerator !== 'undefined') {
            generators.set('rust', RustGenerator);
        }
        if (typeof WgslGenerator !== 'undefined') {
            generators.set('wgsl', WgslGenerator);
        }
        if (typeof BevyGenerator !== 'undefined') {
            generators.set('bevy', BevyGenerator);
        }
        
        // Initialize multi-file generator with performance cache
        multiFileGenerator = new MultiFileGenerator(generators, performanceCache);
        console.log('[App] Multi-File Generator initialized');
        
        // Initialize reference manager
        referenceManager = new ReferenceManager(workspace);
        console.log('[App] Reference Manager initialized');
        
        // Initialize tabbed code display
        tabbedCodeDisplay = new TabbedCodeDisplay('codeTabbedDisplay');
        console.log('[App] Tabbed Code Display initialized');
        
        // Initialize file link visualizer
        fileLinkVisualizer = new FileLinkVisualizer(workspace);
        window.fileLinkVisualizer = fileLinkVisualizer; // Make globally accessible
        console.log('[App] File Link Visualizer initialized');
        
        // Set up event listeners
        setupEventListeners();
        
        // Set up mode manager listeners
        setupModeManagerListeners();
        
        // Set up workspace change listener for debounced code generation
        workspace.addChangeListener(onWorkspaceChange);
        
        // Set up throttled rendering optimization for large workspaces
        workspace.addChangeListener(createThrottledRenderOptimizer());
        
        // Set up connection validation listener
        workspace.addChangeListener(onConnectionChange);
        
        // Initialize UI
        initializeUI();
        
        // Load initial toolbox for default mode
        console.log('[App] Loading initial toolbox for mode:', currentMode);
        
        try {
            // Load the toolbox directly to ensure it appears on initial load
            await toolboxManager.loadToolbox(currentMode);
            console.log('[App] Initial toolbox loaded successfully');
        } catch (error) {
            console.error('[App] Error during initial toolbox load:', error);
            errorHandler.showError(error, {
                type: 'initialization_error',
                suggestion: 'Please refresh the page'
            });
        }
        
        // Initialize Rust compiler client
        rustCompiler = new RustCompilerClient({
            serviceUrl: 'http://localhost:3030',
            usePlayground: true,
            quickCheck: false
        });
        console.log('[App] Rust Compiler Client initialized');
        
        // Validate all block definitions (Requirements 7.1, 7.3)
        validateBlockDefinitions();
        
        // Generate initial code
        debouncedGenerateCode();
        
        console.log('[App] Initialization complete');
        
    } catch (error) {
        console.error('[App] Initialization error:', error);
        if (errorHandler) {
            errorHandler.showError(error, {
                type: 'initialization_error',
                suggestion: 'Please refresh the page and try again'
            });
        } else {
            showNotification('Failed to initialize application: ' + error.message, 'error');
        }
    }
}

// ============================================================================
// NOTIFICATION SYSTEM
// ============================================================================

/**
 * Show a notification message to the user
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'info', 'success', 'warning', 'error'
 * @param {number} duration - Duration in ms (0 for persistent)
 */
function showNotification(message, type = 'info', duration = 5000) {
    // Get or create notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icon based on type
    const icons = {
        info: 'ℹ️',
        success: '✓',
        warning: '⚠️',
        error: '✕'
    };
    
    notification.innerHTML = `
        <div class="notification-icon">${icons[type] || icons.info}</div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNotification(notification);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in - use requestAnimationFrame for proper timing
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });
    });
    
    // Store timeout ID so we can cancel it if needed
    let timeoutId = null;
    
    // Auto-remove after duration (if not persistent)
    if (duration > 0) {
        timeoutId = setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    // Store timeout ID on notification for potential cancellation
    notification._timeoutId = timeoutId;
    
    return notification;
}

/**
 * Close a notification with proper animation
 * @param {HTMLElement} notification - The notification element to close
 */
function closeNotification(notification) {
    if (!notification || !notification.parentElement) return;
    
    // Cancel any pending auto-close timeout
    if (notification._timeoutId) {
        clearTimeout(notification._timeoutId);
        notification._timeoutId = null;
    }
    
    // Remove show class to trigger exit animation
    notification.classList.remove('notification-show');
    
    // Remove from DOM after animation completes
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 300);
}

/**
 * Show an expandable error notification with details
 * @param {string} message - The error message
 * @param {Object} details - Additional error details
 * @param {number} duration - Duration in ms (0 for persistent, default 15000)
 */
function showErrorNotification(message, details = {}, duration = 15000) {
    // Get or create notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification notification-error notification-expandable';
    
    // Mark as persistent if duration is 0
    if (duration === 0) {
        notification.dataset.persistent = 'true';
    }
    
    // Build details HTML
    let detailsHtml = '';
    if (details.stack) {
        detailsHtml += `<div class="notification-detail"><strong>Stack:</strong><pre>${escapeHtml(details.stack)}</pre></div>`;
    }
    if (details.context) {
        detailsHtml += `<div class="notification-detail"><strong>Context:</strong><pre>${escapeHtml(JSON.stringify(details.context, null, 2))}</pre></div>`;
    }
    if (details.suggestions && details.suggestions.length > 0) {
        detailsHtml += `<div class="notification-detail"><strong>Suggestions:</strong><ul>`;
        details.suggestions.forEach(s => {
            detailsHtml += `<li>${escapeHtml(s)}</li>`;
        });
        detailsHtml += `</ul></div>`;
    }
    
    const hasDetails = detailsHtml.length > 0;
    
    notification.innerHTML = `
        <div class="notification-icon">✕</div>
        <div class="notification-content">
            <div class="notification-message">${escapeHtml(message)}</div>
            ${hasDetails ? `
                <button class="notification-expand">
                    Show Details ▼
                </button>
                <div class="notification-details" style="display: none;">
                    ${detailsHtml}
                </div>
            ` : ''}
        </div>
        <button class="notification-close">×</button>
    `;
    
    // Add expand button handler if details exist
    if (hasDetails) {
        const expandBtn = notification.querySelector('.notification-expand');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleNotificationDetails(expandBtn);
        });
    }
    
    // Add close button handler
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNotification(notification);
    });
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in - use requestAnimationFrame for proper timing
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            notification.classList.add('notification-show');
        });
    });
    
    // Store timeout ID so we can cancel it if needed
    let timeoutId = null;
    
    // Auto-remove after duration (if not persistent)
    if (duration > 0) {
        timeoutId = setTimeout(() => {
            closeNotification(notification);
        }, duration);
    }
    
    // Store timeout ID on notification for potential cancellation
    notification._timeoutId = timeoutId;
    
    return notification;
}

/**
 * Toggle notification details visibility
 * @param {HTMLElement} button - The expand button
 */
function toggleNotificationDetails(button) {
    const details = button.nextElementSibling;
    if (details && details.classList.contains('notification-details')) {
        const isHidden = details.style.display === 'none';
        details.style.display = isHidden ? 'block' : 'none';
        button.textContent = isHidden ? 'Hide Details ▲' : 'Show Details ▼';
    }
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================================
// TOOLBOX AND THEME
// ============================================================================

/**
 * Get initial toolbox configuration (minimal structure for fast loading)
 */
function getInitialToolbox() {
    return {
        kind: 'categoryToolbox',
        contents: [
            {
                kind: 'category',
                name: 'Loading...',
                colour: '230',
                contents: [
                    {
                        kind: 'label',
                        text: 'Initializing...'
                    }
                ]
            }
        ]
    };
}

/**
 * Create the Biospheres theme for Blockly
 */
function createBiospheresTheme() {
    return Blockly.Theme.defineTheme('biospheres', {
        'base': Blockly.Themes.Classic,
        'componentStyles': {
            'workspaceBackgroundColour': '#1e1e1e',
            'toolboxBackgroundColour': '#252526',
            'toolboxForegroundColour': '#d4d4d4',
            'flyoutBackgroundColour': '#252526',
            'flyoutForegroundColour': '#d4d4d4',
            'flyoutOpacity': 0.9,
            'scrollbarColour': '#505050',
            'insertionMarkerColour': '#4ec9b0',
            'insertionMarkerOpacity': 0.3
        }
    });
}

// ========== EVENT LISTENERS ==========

/**
 * Set up all event listeners for UI elements
 */
function setupEventListeners() {
    // Mode selector
    const modeSelector = document.getElementById('editorMode');
    if (modeSelector) {
        modeSelector.addEventListener('change', onModeChange);
    }
    
    // Toolbar buttons
    const buttons = {
        'checkCode': checkRustCode,
        'parseCode': parseCode,
        'importCode': importCode,
        'exportCode': exportCode,
        'saveWorkspace': exportWorkspace,
        'loadBlocks': loadWorkspace,
        'clearWorkspace': clearWorkspace,
        'copyCode': copyCode,
        'showExamples': showExamples,
        'showWorkflows': showWorkflows,
        'saveAsTemplate': saveAsTemplate,
        'validateWorkspace': validateWorkspace,
        'toggleCodePanel': toggleCodePanel
    };
    
    for (const [id, handler] of Object.entries(buttons)) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        }
    }
    
    // Code tabs (if they exist)
    setupCodeTabListeners();
    
    // Dropdown toggle
    setupDropdownToggle();
}

/**
 * Set up mode manager event listeners
 */
function setupModeManagerListeners() {
    if (!modeManager) return;
    
    // Listen for mode changes
    modeManager.on('afterModeChange', (data) => {
        console.log('[App] Mode changed:', data.from, '->', data.to);
        currentMode = data.to;
        
        // Update UI to reflect new mode
        updateModeUI(data.to);
        
        // Regenerate code for new mode
        debouncedGenerateCode();
    });
    
    modeManager.on('modeChangeError', (data) => {
        console.error('[App] Mode change error:', data.error);
        errorHandler.showError(data.error, {
            type: 'mode_error',
            suggestion: `Failed to switch to ${data.to} mode. Please try again.`
        });
    });
}

/**
 * Set up code tab listeners for multi-file display
 */
function setupCodeTabListeners() {
    const tabContainer = document.getElementById('code-tabs');
    if (!tabContainer) return;
    
    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('code-tab')) {
            const filename = e.target.dataset.filename;
            if (filename) {
                showCodeTab(filename);
            }
        }
    });
}

/**
 * Set up dropdown toggle functionality
 */
function setupDropdownToggle() {
    const dropdownButton = document.getElementById('showExamplesMenu');
    const dropdownContent = document.getElementById('examplesDropdown');
    
    if (!dropdownButton || !dropdownContent) return;
    
    // Toggle dropdown on button click
    dropdownButton.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownContent.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdownContent.classList.remove('show');
        }
    });
    
    // Close dropdown when clicking a menu item
    dropdownContent.addEventListener('click', () => {
        dropdownContent.classList.remove('show');
    });
}



/**
 * Handle workspace changes with debouncing
 */
function onWorkspaceChange(event) {
    // Ignore UI events
    if (event.type === Blockly.Events.UI || 
        event.type === Blockly.Events.FINISHED_LOADING) {
        return;
    }
    
    // Handle block deletion - clear errors for deleted blocks
    if (event.type === Blockly.Events.BLOCK_DELETE && event.blockId) {
        if (errorHandler) {
            errorHandler.clearBlockError(event.blockId);
        }
    }
    
    // Invalidate performance cache (code and validation)
    if (performanceCache) {
        performanceCache.invalidateAll();
    }
    
    // Invalidate multi-file generator cache
    if (multiFileGenerator) {
        multiFileGenerator.invalidateCache();
    }
    
    // Debounced code generation
    debouncedGenerateCode();
    
    // Debounced validation
    debouncedValidation();
}

/**
 * Handle connection changes for validation
 */
function onConnectionChange(event) {
    // Only handle connection events
    if (event.type !== Blockly.Events.BLOCK_MOVE) {
        return;
    }
    
    // Check if this was a connection attempt
    if (!event.newParentId && !event.newInputName) {
        return;
    }
    
    // Validate the connection
    if (validator && errorHandler) {
        const block = workspace.getBlockById(event.blockId);
        if (block) {
            // Validate all connections on this block
            const validationResult = validator.validateBlock(block);
            
            if (!validationResult.valid) {
                console.warn('[App] Connection validation failed:', validationResult.errors);
                
                // Show errors
                validationResult.errors.forEach(error => {
                    errorHandler.showError(error, {
                        blockId: block.id,
                        blockType: block.type,
                        type: 'invalid_connection',
                        suggestion: 'Check that connected blocks have compatible types'
                    });
                });
            } else {
                // Clear any previous connection errors for this block
                errorHandler.clearBlockError(block.id);
            }
        }
    }
}

/**
 * Create throttled render optimizer for workspace changes
 * Optimizes rendering for large workspaces (>100 blocks)
 */
function createThrottledRenderOptimizer() {
    let throttledOptimize = null;
    
    return (event) => {
        // Only optimize on certain event types
        if (event.type !== Blockly.Events.BLOCK_MOVE &&
            event.type !== Blockly.Events.VIEWPORT_CHANGE) {
            return;
        }
        
        // Create throttled function if needed
        if (!throttledOptimize && performanceOptimizer) {
            throttledOptimize = performanceOptimizer.throttle(
                'workspaceRender',
                () => {
                    const blockCount = workspace.getAllBlocks(false).length;
                    
                    // Only optimize if workspace is large
                    if (blockCount > 100) {
                        performanceOptimizer.optimizeWorkspaceRendering(workspace, {
                            enableBlockCulling: true,
                            enableConnectionCulling: false,
                            maxVisibleBlocks: 200
                        });
                    }
                },
                100, // Throttle to 10fps
                { leading: false, trailing: true }
            );
        }
        
        if (throttledOptimize) {
            throttledOptimize();
        }
    };
}

/**
 * Handle mode selector change
 */
async function onModeChange(event) {
    const newMode = event.target.value;
    
    if (newMode === currentMode) {
        return;
    }
    
    console.log('[App] User requested mode change:', newMode);
    
    try {
        await switchMode(newMode);
    } catch (error) {
        console.error('[App] Error switching mode:', error);
        // Revert selector to current mode
        event.target.value = currentMode;
    }
}

// ========== MODE MANAGEMENT ==========

/**
 * Switch editor mode
 * @param {string} mode - Target mode ('rust', 'wgsl', 'bevy', 'biospheres')
 */
async function switchMode(mode) {
    if (!modeManager) {
        console.error('[App] Mode manager not initialized');
        return;
    }
    
    try {
        await modeManager.switchMode(mode);
        // Mode manager will trigger afterModeChange event
    } catch (error) {
        console.error('[App] Error switching mode:', error);
        errorHandler.showError(error, {
            type: 'mode_error',
            suggestion: 'Failed to switch mode. Please try again.'
        });
    }
}

/**
 * Update UI to reflect current mode
 */
function updateModeUI(mode) {
    // Update mode selector
    const modeSelector = document.getElementById('editorMode');
    if (modeSelector) {
        modeSelector.value = mode;
        // Set data attribute for CSS styling
        modeSelector.setAttribute('data-current-mode', mode);
    }
    
    // Update mode indicator if it exists
    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator) {
        const config = modeManager.getModeConfig(mode);
        if (config) {
            modeIndicator.textContent = config.displayName;
            modeIndicator.style.backgroundColor = config.theme.primaryColor;
        }
    }
    
    // Update body class for CSS styling
    document.body.classList.remove('mode-rust', 'mode-wgsl', 'mode-bevy');
    document.body.classList.add(`mode-${mode}`);
}

// ========== CODE GENERATION ==========

/**
 * Debounced code generation (300ms delay)
 */
const debouncedGenerateCode = (() => {
    let debouncedFn = null;
    
    return () => {
        if (!debouncedFn && performanceOptimizer) {
            debouncedFn = performanceOptimizer.debounce(
                'codeGeneration',
                generateCode,
                CODE_GENERATION_DELAY,
                { maxWait: 1000 } // Force generation after 1 second max
            );
        }
        
        if (debouncedFn) {
            debouncedFn();
        } else {
            // Fallback if optimizer not available
            if (codeGenerationTimer) {
                clearTimeout(codeGenerationTimer);
            }
            codeGenerationTimer = setTimeout(generateCode, CODE_GENERATION_DELAY);
        }
    };
})();

/**
 * Generate code immediately (bypass debounce)
 */
function generateCodeNow() {
    // Clear debounce timer
    if (codeGenerationTimer) {
        clearTimeout(codeGenerationTimer);
        codeGenerationTimer = null;
    }
    
    generateCode();
}

/**
 * Generate code for all files in the workspace
 */
function generateCode() {
    if (!workspace || !multiFileGenerator) {
        console.warn('[App] Cannot generate code: workspace or generator not initialized');
        console.warn('[App] workspace:', workspace);
        console.warn('[App] multiFileGenerator:', multiFileGenerator);
        return;
    }
    
    try {
        console.log('[App] Generating code...');
        console.log('[App] Current mode:', currentMode);
        console.log('[App] Workspace blocks:', workspace.getAllBlocks(false).length);
        
        // Debug: Check if generator exists for current mode
        const generator = multiFileGenerator.generators.get(currentMode);
        console.log('[App] Generator for mode:', currentMode, generator ? 'EXISTS' : 'MISSING');
        
        if (generator) {
            console.log('[App] Generator type:', generator.constructor.name);
            console.log('[App] Generator has forBlock:', Object.keys(generator.forBlock || {}).length, 'blocks');
            console.log('[App] Sample blocks:', Object.keys(generator.forBlock || {}).slice(0, 5));
        }
        
        const startTime = performance.now();
        
        // Generate code for all files
        currentFiles = multiFileGenerator.generateAll(workspace);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        console.log(`[App] Code generated in ${duration.toFixed(2)}ms for ${currentFiles.size} file(s)`);
        
        // Debug: Show what files were generated
        if (currentFiles.size > 0) {
            console.log('[App] Generated files:', Array.from(currentFiles.keys()));
            currentFiles.forEach((code, filename) => {
                console.log(`[App] ${filename}: ${code.length} characters`);
            });
        } else {
            console.warn('[App] No files generated!');
        }
        
        // Check performance target (< 200ms per requirement 5.2)
        if (duration > 200) {
            console.warn(`[App] Code generation took ${duration.toFixed(2)}ms, exceeding 200ms target`);
        }
        
        // Update code display
        updateCodeDisplay();
        
    } catch (error) {
        console.error('[App] Error generating code:', error);
        console.error('[App] Error stack:', error.stack);
        errorHandler.showError(error, {
            type: 'generation_error',
            suggestion: 'Check that all blocks are properly configured',
            showNotification: true
        });
        
        // Display error in code output
        displayCodeError(error);
    }
}

/**
 * Update the code display with generated files
 */
function updateCodeDisplay() {
    if (!tabbedCodeDisplay) {
        console.warn('[App] Tabbed code display not initialized');
        return;
    }
    
    // Update the tabbed display with current files
    tabbedCodeDisplay.updateFiles(currentFiles);
}

/**
 * Display code when no files are generated
 */
function displayEmptyCode() {
    const codeElement = document.getElementById('generatedCode');
    if (codeElement) {
        codeElement.textContent = '// No code generated yet\n// Add blocks to the workspace to generate code';
    }
    
    // Hide tabs
    const tabContainer = document.getElementById('code-tabs');
    if (tabContainer) {
        tabContainer.style.display = 'none';
    }
}

/**
 * Display a single file's code
 */
function displaySingleFile(filename, code) {
    const codeElement = document.getElementById('generatedCode');
    if (codeElement) {
        codeElement.textContent = code || '// Empty file';
    }
    
    // Hide tabs for single file
    const tabContainer = document.getElementById('code-tabs');
    if (tabContainer) {
        tabContainer.style.display = 'none';
    }
    
    activeTab = filename;
}

/**
 * Display multiple files with tabbed interface
 */
function displayMultipleFiles() {
    const tabContainer = document.getElementById('code-tabs');
    const codeElement = document.getElementById('generatedCode');
    
    if (!tabContainer || !codeElement) {
        console.warn('[App] Code tabs or code element not found');
        return;
    }
    
    // Show tab container
    tabContainer.style.display = 'flex';
    
    // Clear existing tabs
    tabContainer.innerHTML = '';
    
    // Create tabs for each file
    const filenames = Array.from(currentFiles.keys());
    filenames.forEach((filename, index) => {
        const tab = document.createElement('button');
        tab.className = 'code-tab';
        tab.dataset.filename = filename;
        tab.textContent = filename;
        
        // Set first tab as active if no active tab
        if (!activeTab || index === 0) {
            tab.classList.add('active');
            activeTab = filename;
        } else if (filename === activeTab) {
            tab.classList.add('active');
        }
        
        tabContainer.appendChild(tab);
    });
    
    // Display code for active tab
    showCodeTab(activeTab);
}

/**
 * Show code for a specific tab
 */
function showCodeTab(filename) {
    if (!currentFiles.has(filename)) {
        console.warn('[App] File not found:', filename);
        return;
    }
    
    // Update active tab
    activeTab = filename;
    
    // Update tab UI
    const tabs = document.querySelectorAll('.code-tab');
    tabs.forEach(tab => {
        if (tab.dataset.filename === filename) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Display code
    const code = currentFiles.get(filename);
    const codeElement = document.getElementById('generatedCode');
    if (codeElement) {
        codeElement.textContent = code || '// Empty file';
    }
}

/**
 * Display error in code output
 */
function displayCodeError(error) {
    const codeElement = document.getElementById('generatedCode');
    if (codeElement) {
        codeElement.textContent = `// Error generating code:\n// ${error.message}\n\n// Check the error panel for more details`;
    }
}

// ========== VALIDATION ==========

/**
 * Debounced validation (150ms delay)
 */
const debouncedValidation = (() => {
    let debouncedFn = null;
    
    return () => {
        if (!debouncedFn && performanceOptimizer) {
            debouncedFn = performanceOptimizer.debounce(
                'validation',
                validateWorkspace,
                VALIDATION_DELAY,
                { maxWait: 500 } // Force validation after 500ms max
            );
        }
        
        if (debouncedFn) {
            debouncedFn();
        } else {
            // Fallback if optimizer not available
            if (validationTimer) {
                clearTimeout(validationTimer);
            }
            validationTimer = setTimeout(validateWorkspace, VALIDATION_DELAY);
        }
    };
})();

/**
 * Validate the entire workspace
 */
function validateWorkspace() {
    if (!workspaceManager) {
        console.warn('[App] Workspace manager not initialized');
        return;
    }
    
    try {
        console.log('[App] Validating workspace...');
        
        const result = workspaceManager.validateWorkspace();
        
        if (!result.valid) {
            console.warn('[App] Workspace validation failed:', result.errors);
            
            // Show errors in error panel
            result.errors.forEach(error => {
                errorHandler.showError(error, {
                    type: 'validation_error'
                });
            });
        } else {
            console.log('[App] Workspace validation passed');
            
            // Clear validation errors
            errorHandler.clearErrors();
        }
        
        // Log warnings
        if (result.warnings.length > 0) {
            console.warn('[App] Validation warnings:', result.warnings);
        }
        
        // Check for disconnected blocks
        if (errorHandler) {
            const disconnectedBlocks = errorHandler.validateDisconnectedBlocks(workspace);
            if (disconnectedBlocks.length > 0) {
                console.warn(`[App] Found ${disconnectedBlocks.length} block(s) with disconnected required inputs`);
                disconnectedBlocks.forEach(block => {
                    console.warn(`  - Block type: ${block.type}, missing inputs:`, block.missingInputs);
                });
            }
        }
        
    } catch (error) {
        console.error('[App] Error during validation:', error);
    }
}

/**
 * Validate all block definitions against naming convention
 * Requirements: 7.1, 7.3
 */
function validateBlockDefinitions() {
    if (!namingValidator) {
        console.warn('[App] Naming validator not initialized');
        return;
    }
    
    try {
        console.log('[App] Validating block definitions...');
        
        const report = namingValidator.validateAllDefinitions();
        
        console.log('[App] Naming validation report:', {
            total: report.totalBlocks,
            valid: report.validBlocks,
            invalid: report.invalidBlocks,
            byMode: report.blocksByMode
        });
        
        if (!report.valid) {
            console.warn('[App] Found blocks with invalid names:');
            report.errors.forEach(error => {
                console.warn(`  - ${error.blockType}: ${error.error}`);
                if (error.suggestion) {
                    console.warn(`    Suggestion: ${error.suggestion}`);
                }
            });
            
            // Show warning in UI
            if (errorHandler) {
                errorHandler.showError(new Error('Some blocks have invalid names'), {
                    type: 'naming_convention_warning',
                    details: `${report.invalidBlocks} block(s) do not follow the naming convention`,
                    suggestion: 'Check console for details'
                });
            }
        } else {
            console.log('[App] All block definitions follow naming convention ✓');
        }
        
        return report;
        
    } catch (error) {
        console.error('[App] Error during naming validation:', error);
        return null;
    }
}

/**
 * Search blocks by name with optional mode filter
 * Requirements: 7.5
 * @param {string} searchTerm - The search term
 * @param {string} mode - Optional mode filter (rust, wgsl, bevy, bio)
 * @returns {Array<string>} Matching block types
 */
function searchBlocks(searchTerm, mode = null) {
    if (!namingValidator) {
        console.warn('[App] Naming validator not initialized');
        return [];
    }
    
    try {
        const results = namingValidator.searchBlocks(searchTerm, mode);
        console.log(`[App] Search for "${searchTerm}" (mode: ${mode || 'all'}):`, results);
        return results;
    } catch (error) {
        console.error('[App] Error during block search:', error);
        return [];
    }
}

/**
 * Get all blocks for a specific mode
 * Requirements: 7.2, 7.5
 * @param {string} mode - The mode to filter by (rust, wgsl, bevy, bio)
 * @returns {Array<string>} Block types for that mode
 */
function getBlocksByMode(mode) {
    if (!namingValidator) {
        console.warn('[App] Naming validator not initialized');
        return [];
    }
    
    try {
        const blocks = namingValidator.getBlocksByMode(mode);
        console.log(`[App] Blocks for mode "${mode}":`, blocks.length);
        return blocks;
    } catch (error) {
        console.error('[App] Error getting blocks by mode:', error);
        return [];
    }
}

/**
 * Generate documentation grouped by mode
 * Requirements: 7.4
 * @returns {Object} Documentation structure organized by mode
 */
function generateBlockDocumentation() {
    if (!namingValidator) {
        console.warn('[App] Naming validator not initialized');
        return null;
    }
    
    try {
        const docs = namingValidator.generateDocumentation();
        console.log('[App] Generated block documentation:', {
            rust: docs.rust.length,
            wgsl: docs.wgsl.length,
            bevy: docs.bevy.length,
            bio: docs.bio.length
        });
        return docs;
    } catch (error) {
        console.error('[App] Error generating documentation:', error);
        return null;
    }
}

// ========== WORKSPACE OPERATIONS ==========

/**
 * Export workspace as XML file
 */
function exportWorkspace() {
    if (!workspaceManager) {
        console.warn('[App] Workspace manager not initialized');
        return;
    }
    
    try {
        const filename = `biospheres_${currentMode}_blocks.xml`;
        workspaceManager.exportToFile(filename);
        console.log('[App] Workspace exported:', filename);
    } catch (error) {
        console.error('[App] Error exporting workspace:', error);
        errorHandler.showError(error, {
            type: 'export_error',
            suggestion: 'Failed to export workspace. Please try again.'
        });
    }
}

/**
 * Load workspace from XML file
 */
async function loadWorkspace() {
    if (!workspaceManager) {
        console.warn('[App] Workspace manager not initialized');
        return;
    }
    
    try {
        const success = await workspaceManager.importFromFile();
        
        if (success) {
            console.log('[App] Workspace loaded successfully');
            
            // Regenerate code
            generateCodeNow();
        }
    } catch (error) {
        console.error('[App] Error loading workspace:', error);
        errorHandler.showError(error, {
            type: 'import_error',
            suggestion: 'Failed to load workspace. Check that the file is valid XML.'
        });
    }
}

/**
 * Clear workspace with confirmation
 */
function clearWorkspace() {
    if (!workspaceManager) {
        console.warn('[App] Workspace manager not initialized');
        return;
    }
    
    // Check for unsaved changes
    if (workspaceManager.hasUnsavedChanges()) {
        if (!confirm('You have unsaved changes. Clear all blocks? This cannot be undone.')) {
            return;
        }
    } else {
        if (!confirm('Clear all blocks? This cannot be undone.')) {
            return;
        }
    }
    
    try {
        workspaceManager.clear();
        console.log('[App] Workspace cleared');
        
        // Clear code display
        currentFiles.clear();
        updateCodeDisplay();
        
        // Clear errors
        errorHandler.clearErrors();
        
    } catch (error) {
        console.error('[App] Error clearing workspace:', error);
        errorHandler.showError(error, {
            type: 'clear_error',
            suggestion: 'Failed to clear workspace. Please refresh the page.'
        });
    }
}

// ========== CODE EXPORT ==========

/**
 * Export generated code as file(s)
 */
function exportCode() {
    if (currentFiles.size === 0) {
        showNotification('No code to export. Add blocks to the workspace first.', 'warning');
        return;
    }
    
    try {
        if (currentFiles.size === 1) {
            // Export single file
            const [filename, code] = currentFiles.entries().next().value;
            exportSingleFile(filename, code);
        } else {
            // Export as ZIP
            exportAsZip();
        }
    } catch (error) {
        console.error('[App] Error exporting code:', error);
        errorHandler.showError(error, {
            type: 'export_error',
            suggestion: 'Failed to export code. Please try again.'
        });
    }
}

/**
 * Export a single file
 */
function exportSingleFile(filename, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('[App] Code exported:', filename);
}

/**
 * Export multiple files as ZIP
 */
async function exportAsZip() {
    if (!multiFileGenerator) {
        console.warn('[App] Multi-file generator not initialized');
        return;
    }
    
    try {
        const zipBlob = await multiFileGenerator.exportAsZip(currentFiles);
        
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `biospheres_${currentMode}_project.zip`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('[App] Project exported as ZIP');
    } catch (error) {
        console.error('[App] Error creating ZIP:', error);
        
        // Fallback: export files individually
        if (confirm('Failed to create ZIP. Export files individually instead?')) {
            for (const [filename, code] of currentFiles.entries()) {
                exportSingleFile(filename, code);
            }
        }
    }
}

/**
 * Copy code to clipboard
 */
function copyCode() {
    const codeElement = document.getElementById('generatedCode');
    if (!codeElement) {
        return;
    }
    
    const code = codeElement.textContent;
    
    navigator.clipboard.writeText(code).then(() => {
        console.log('[App] Code copied to clipboard');
        
        // Visual feedback
        const btn = document.getElementById('copyCode');
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = originalText, 2000);
        }
    }).catch(error => {
        console.error('[App] Error copying to clipboard:', error);
        showNotification('Failed to copy code to clipboard', 'error');
    });
}

/**
 * Toggle code panel visibility
 */
function toggleCodePanel() {
    const codePanel = document.getElementById('codePanel');
    const toggleBtn = document.getElementById('toggleCodePanel');
    
    if (!codePanel || !toggleBtn) {
        return;
    }
    
    const isCollapsed = codePanel.classList.toggle('collapsed');
    
    // Update button text and title
    if (isCollapsed) {
        toggleBtn.textContent = '👁️ Show';
        toggleBtn.title = 'Show code panel';
    } else {
        toggleBtn.textContent = '👁️ Hide';
        toggleBtn.title = 'Hide code panel';
    }
    
    // Trigger Blockly resize after animation completes
    setTimeout(() => {
        if (workspace) {
            Blockly.svgResize(workspace);
        }
    }, 300);
}

// ========== CODE PARSING ==========

/**
 * Parse code and create blocks
 */
function parseCode() {
    const code = prompt('Paste your code here:');
    if (!code) {
        return;
    }
    
    try {
        // Determine language from current mode
        const config = modeManager.getModeConfig(currentMode);
        const extension = config ? config.fileExtension : 'rs';
        
        // Try to parse based on extension
        if (extension === 'rs') {
            parseRustCode(code);
        } else if (extension === 'wgsl') {
            parseWGSLCode(code);
        } else {
            showNotification('Code parsing not yet implemented for this mode', 'info');
        }
    } catch (error) {
        console.error('[App] Parse error:', error);
        errorHandler.showError(error, {
            type: 'parse_error',
            suggestion: 'Failed to parse code. Check that the syntax is valid.'
        });
    }
}

/**
 * Parse Rust code
 */
function parseRustCode(code) {
    if (typeof RustCodeParser === 'undefined') {
        showNotification('Rust code parser not available', 'warning');
        return;
    }
    
    try {
        const parser = new RustCodeParser(workspace);
        parser.loadIntoWorkspace(code);
        showNotification('Code parsed successfully!', 'success');
        
        // Regenerate code
        generateCodeNow();
    } catch (error) {
        throw error;
    }
}

/**
 * Parse WGSL code
 */
function parseWGSLCode(code) {
    showNotification('WGSL code parsing not yet implemented', 'info');
}

// ========== CODE IMPORT ==========

/**
 * Import code files and convert to blocks
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 16.2
 */
function importCode() {
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.rs,.wgsl';
    
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
        const files = event.target.files;
        
        if (!files || files.length === 0) {
            return;
        }
        
        try {
            await importCodeFiles(files);
        } catch (error) {
            console.error('[App] Import error:', error);
            errorHandler.showError(error, {
                type: 'import_error',
                suggestion: 'Failed to import code files. Check that the files are valid.'
            });
        }
    });
    
    // Trigger file selection dialog
    fileInput.click();
}

/**
 * Import multiple code files
 * @param {FileList} files - Files to import
 */
async function importCodeFiles(files) {
    console.log(`[App] Importing ${files.length} file(s)...`);
    
    // Show progress indicator
    const progressIndicator = showProgressIndicator('Importing files...');
    
    try {
        // Read all files
        const fileContents = new Map();
        const filePromises = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            filePromises.push(readFileAsText(file).then(content => {
                fileContents.set(file.name, content);
                updateProgressIndicator(progressIndicator, `Reading ${file.name}...`, (i + 1) / files.length * 50);
            }));
        }
        
        await Promise.all(filePromises);
        
        console.log('[App] All files read successfully');
        updateProgressIndicator(progressIndicator, 'Parsing code...', 60);
        
        // Parse files using MultiModeCodeParser
        if (typeof MultiModeCodeParser === 'undefined') {
            throw new Error('Code parser not available');
        }
        
        const parser = new MultiModeCodeParser(workspace);
        
        if (fileContents.size === 1) {
            // Single file import
            const [filename, code] = fileContents.entries().next().value;
            console.log('[App] Importing single file:', filename, 'code length:', code.length);
            
            const mode = parser.detectModeFromFilename(filename);
            console.log('[App] Detected mode:', mode);
            
            updateProgressIndicator(progressIndicator, `Parsing ${filename}...`, 70);
            
            const blocks = parser.parse(code, mode);
            console.log('[App] Parser returned', blocks.length, 'blocks');
            
            if (parser.hasErrors()) {
                console.warn('[App] Parse errors:', parser.getErrors());
                showParseErrors(parser.getErrors());
            }
            
            if (blocks.length === 0) {
                console.warn('[App] No blocks were parsed from the file!');
                hideProgressIndicator(progressIndicator);
                showNotification(`No blocks could be parsed from ${filename}. The file may be empty or contain unsupported syntax.`, 'warning');
                return;
            }
            
            // Filter out blocks with undefined types and convert incompatible blocks
            const fileExtension = filename.split('.').pop();
            const validBlocks = blocks.map(block => {
                const isDefined = typeof Blockly.Blocks[block.type] !== 'undefined';
                if (!isDefined) {
                    console.warn('[App] Converting undefined block type to comment:', block.type);
                    // Convert to comment block
                    return {
                        type: 'rust_comment',
                        id: block.id,
                        fields: {
                            TEXT: `[Imported ${block.type}] - block type not available`
                        }
                    };
                }
                
                // Convert WGSL blocks to comments in Rust files (preserve the code)
                if (fileExtension === 'rs' && block.type.startsWith('wgsl_')) {
                    console.warn('[App] Converting WGSL block to comment in Rust file:', block.type);
                    return {
                        type: 'rust_comment',
                        id: block.id,
                        fields: {
                            TEXT: `[WGSL code] - ${block.type}`
                        }
                    };
                }
                
                // Convert Rust blocks to comments in WGSL files
                if (fileExtension === 'wgsl' && (block.type.startsWith('rust_') || block.type.startsWith('bevy_'))) {
                    console.warn('[App] Converting Rust/Bevy block to comment in WGSL file:', block.type);
                    return {
                        type: 'wgsl_comment',
                        id: block.id,
                        fields: {
                            TEXT: `[Rust code] - ${block.type}`
                        }
                    };
                }
                
                return block;
            });
            
            console.log('[App] Processed blocks:', blocks.length, '->', validBlocks.length);
            
            if (validBlocks.length === 0) {
                hideProgressIndicator(progressIndicator);
                showNotification(`No valid blocks could be imported from ${filename}. The file may contain unsupported block types.`, 'warning');
                return;
            }
            
            updateProgressIndicator(progressIndicator, 'Creating blocks...', 80);
            
            // Convert to XML and load into workspace
            const xml = parser.blocksToXml(validBlocks, filename);
            console.log('[App] Generated XML:', xml.substring(0, 500) + '...');
            console.log('[App] Full XML for debugging:', xml);
            
            const xmlDom = Blockly.utils.xml.textToDom(xml);
            console.log('[App] XML DOM created, children:', xmlDom.children.length);
            
            // Ask user if they want to clear workspace or append
            const shouldClear = await confirmClearWorkspace();
            
            console.log('[App] Loading XML into workspace...');
            
            try {
                if (shouldClear) {
                    Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlDom, workspace);
                } else {
                    Blockly.Xml.appendDomToWorkspace(xmlDom, workspace);
                }
            } catch (error) {
                console.error('[App] Error loading XML:', error);
                throw error;
            }
            
            console.log(`[App] Imported ${blocks.length} block(s) from ${filename}`);
            const loadedBlocks = workspace.getAllBlocks(false);
            console.log('[App] Workspace now has', loadedBlocks.length, 'blocks');
            
            // Log what blocks were actually loaded
            loadedBlocks.forEach(block => {
                console.log('[App] Loaded block type:', block.type, 'id:', block.id);
            });
            
        } else {
            // Multi-file import with reference preservation
            updateProgressIndicator(progressIndicator, 'Parsing multiple files...', 70);
            
            const results = parser.parseMultipleFiles(fileContents);
            
            if (parser.hasErrors()) {
                console.warn('[App] Parse errors:', parser.getErrors());
                showParseErrors(parser.getErrors());
            }
            
            updateProgressIndicator(progressIndicator, 'Creating blocks...', 80);
            
            // Create separate file containers for each file
            let xml = '<xml xmlns="https://developers.google.com/blockly/xml">\n';
            let xOffset = 20;
            
            for (const [filename, { blocks }] of results.entries()) {
                console.log(`[App] Parsed ${blocks.length} block(s) from ${filename}`);
                
                // Create file container for this file
                const fileXml = parser.blocksToXml(blocks, filename);
                // Extract just the block part (without xml wrapper) and adjust position
                const blockMatch = fileXml.match(/<block type="file_container"[^>]*>[\s\S]*<\/block>/);
                if (blockMatch) {
                    // Update x position for each file
                    const adjustedBlock = blockMatch[0].replace(/x="\d+"/, `x="${xOffset}"`);
                    xml += adjustedBlock + '\n';
                    xOffset += 600; // Space files horizontally
                }
            }
            
            xml += '</xml>';
            const xmlDom = Blockly.utils.xml.textToDom(xml);
            
            // Ask user if they want to clear workspace or append
            const shouldClear = await confirmClearWorkspace();
            
            if (shouldClear) {
                Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlDom, workspace);
            } else {
                Blockly.Xml.appendDomToWorkspace(xmlDom, workspace);
            }
            
            // Count total blocks imported
            const loadedBlocks = workspace.getAllBlocks(false);
            console.log(`[App] Imported blocks from ${fileContents.size} file(s), workspace now has ${loadedBlocks.length} blocks`);
            
            // Show cross-file references if any
            if (parser.references && parser.references.size > 0) {
                console.log('[App] Cross-file references detected:', parser.references);
                showReferenceInfo(parser.references);
            }
        }
        
        updateProgressIndicator(progressIndicator, 'Generating code...', 90);
        
        // Regenerate code to verify
        generateCodeNow();
        
        updateProgressIndicator(progressIndicator, 'Complete!', 100);
        
        // Hide progress indicator after a short delay
        setTimeout(() => {
            hideProgressIndicator(progressIndicator);
        }, 1000);
        
        // Show success message
        showSuccessMessage(`Successfully imported ${fileContents.size} file(s)`);
        
    } catch (error) {
        hideProgressIndicator(progressIndicator);
        throw error;
    }
}

/**
 * Read file as text
 * @param {File} file - File to read
 * @returns {Promise<string>} File content
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error(`Failed to read file: ${file.name}`));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Show progress indicator
 * @param {string} message - Initial message
 * @returns {HTMLElement} Progress indicator element
 */
function showProgressIndicator(message) {
    // Create progress indicator if it doesn't exist
    let indicator = document.getElementById('importProgressIndicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'importProgressIndicator';
        indicator.className = 'progress-indicator';
        indicator.innerHTML = `
            <div class="progress-content">
                <div class="progress-spinner"></div>
                <div class="progress-message">${message}</div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" style="width: 0%"></div>
                </div>
            </div>
        `;
        document.body.appendChild(indicator);
    }
    
    indicator.style.display = 'flex';
    return indicator;
}

/**
 * Update progress indicator
 * @param {HTMLElement} indicator - Progress indicator element
 * @param {string} message - New message
 * @param {number} percent - Progress percentage (0-100)
 */
function updateProgressIndicator(indicator, message, percent) {
    if (!indicator) return;
    
    const messageEl = indicator.querySelector('.progress-message');
    const fillEl = indicator.querySelector('.progress-bar-fill');
    
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    if (fillEl) {
        fillEl.style.width = `${percent}%`;
    }
}

/**
 * Hide progress indicator
 * @param {HTMLElement} indicator - Progress indicator element
 */
function hideProgressIndicator(indicator) {
    if (indicator) {
        indicator.style.display = 'none';
    }
}

/**
 * Confirm whether to clear workspace before import
 * @returns {Promise<boolean>} True if should clear, false if should append
 */
async function confirmClearWorkspace() {
    const blockCount = workspace.getAllBlocks(false).length;
    
    if (blockCount === 0) {
        // Workspace is empty, no need to ask
        return true;
    }
    
    return new Promise((resolve) => {
        const result = confirm(
            `The workspace currently has ${blockCount} block(s).\n\n` +
            'Click OK to replace all blocks with imported code.\n' +
            'Click Cancel to add imported blocks to existing workspace.'
        );
        resolve(result);
    });
}

/**
 * Show parse errors to user
 * @param {Array} errors - Parse errors
 */
function showParseErrors(errors) {
    if (errors.length === 0) return;
    
    console.warn('[App] Showing parse errors:', errors);
    
    // Show first few errors in error handler
    errors.slice(0, 5).forEach(error => {
        errorHandler.showError(new Error(error.message), {
            type: 'parse_error',
            line: error.line,
            column: error.column,
            suggestion: error.suggestion || 'Some code constructs may not be supported yet'
        });
    });
    
    if (errors.length > 5) {
        errorHandler.showError(new Error(`... and ${errors.length - 5} more errors`), {
            type: 'parse_error',
            suggestion: 'Check the console for full error list'
        });
    }
}

/**
 * Show cross-file reference information
 * @param {Map} references - Cross-file references
 */
function showReferenceInfo(references) {
    console.log('[App] Cross-file references:', references);
    
    let message = 'Cross-file references detected:\n\n';
    
    for (const [sourceFile, refs] of references.entries()) {
        message += `${sourceFile}:\n`;
        refs.forEach(ref => {
            message += `  - ${ref.type}: ${ref.targetPath}\n`;
        });
        message += '\n';
    }
    
    message += 'These references have been preserved in the imported blocks.';
    
    // Show as info message (not error)
    console.info(message);
}

/**
 * Show success message
 * @param {string} message - Success message
 */
function showSuccessMessage(message) {
    console.log('[App] Success:', message);
    
    // Create temporary success notification
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = `✓ ${message}`;
    document.body.appendChild(notification);
    
    // Fade in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Fade out and remove
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ========== WORKFLOWS & EXAMPLES ==========

/**
 * Show example workspaces
 */
function showExamples() {
    console.log('[App] showExamples called');
    console.log('[App] typeof workflowManager:', typeof workflowManager);
    console.log('[App] workflowManager:', workflowManager);
    
    if (typeof workflowManager !== 'undefined') {
        console.log('[App] Calling workflowManager.showExamplesList()');
        workflowManager.showExamplesList();
    } else {
        console.error('[App] workflowManager is undefined!');
        showNotification('Workflow manager not available', 'warning');
    }
}

/**
 * Show workflow guides
 */
function showWorkflows() {
    if (typeof workflowManager !== 'undefined') {
        workflowManager.showWorkflowList();
    } else {
        showNotification('Workflow manager not available', 'warning');
    }
}

/**
 * Save current workspace as a template
 */
function saveAsTemplate() {
    if (typeof workflowManager !== 'undefined') {
        workflowManager.saveAsTemplate();
    } else {
        showNotification('Workflow manager not available', 'warning');
    }
}

// ========== UI INITIALIZATION ==========

/**
 * Initialize UI elements
 */
function initializeUI() {
    // Set up mode selector options
    const modeSelector = document.getElementById('editorMode');
    if (modeSelector && modeManager) {
        // Clear existing options
        modeSelector.innerHTML = '';
        
        // Add options for all modes with emojis
        const modes = modeManager.getAllModes();
        const modeEmojis = {
            'rust': '🦀',
            'wgsl': '🎨',
            'bevy': '🎮'
        };
        
        modes.forEach(config => {
            const option = document.createElement('option');
            option.value = config.mode;
            const emoji = modeEmojis[config.mode] || '';
            option.textContent = `${emoji} ${config.displayName}`;
            option.setAttribute('data-color', config.theme.primaryColor);
            modeSelector.appendChild(option);
        });
        
        // Set current mode
        modeSelector.value = currentMode;
        modeSelector.setAttribute('data-current-mode', currentMode);
    }
    
    // Initialize code tabs container if it doesn't exist
    let tabContainer = document.getElementById('code-tabs');
    if (!tabContainer) {
        const codeContainer = document.getElementById('generatedCode')?.parentElement;
        if (codeContainer) {
            tabContainer = document.createElement('div');
            tabContainer.id = 'code-tabs';
            tabContainer.className = 'code-tabs';
            tabContainer.style.display = 'none';
            codeContainer.insertBefore(tabContainer, codeContainer.firstChild);
        }
    }
    
    // Update mode UI
    updateModeUI(currentMode);
}

// ========== APPLICATION STARTUP ==========

// ============================================================================
// GLOBAL ERROR HANDLERS
// ============================================================================

/**
 * Catch uncaught errors and show as notifications instead of alerts
 */
window.addEventListener('error', (event) => {
    event.preventDefault(); // Prevent default browser error dialog
    console.error('[Global Error Handler]', event.error);
    
    if (typeof showErrorNotification === 'function') {
        showErrorNotification(
            event.error?.message || event.message || 'An unexpected error occurred',
            {
                stack: event.error?.stack,
                context: {
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }
            }
        );
    }
});

/**
 * Catch unhandled promise rejections
 */
window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault(); // Prevent default browser error dialog
    console.error('[Unhandled Promise Rejection]', event.reason);
    
    if (typeof showErrorNotification === 'function') {
        showErrorNotification(
            event.reason?.message || String(event.reason) || 'An unhandled promise rejection occurred',
            {
                stack: event.reason?.stack,
                context: {
                    promise: 'Promise rejection'
                }
            }
        );
    }
});

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Start the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] DOM loaded, initializing application...');
    initWorkspace();
});

/**
 * Handle before unload (warn about unsaved changes)
 */
window.addEventListener('beforeunload', (e) => {
    if (workspaceManager && workspaceManager.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});

/**
 * Handle page unload (cleanup)
 */
window.addEventListener('unload', () => {
    // Clean up performance optimizer
    if (performanceOptimizer) {
        performanceOptimizer.dispose();
    }
    
    // Clean up workspace manager
    if (workspaceManager) {
        workspaceManager.dispose();
    }
});

// ========== EXPORTS ==========

// Export functions for external access
window.blocklyApp = {
    switchMode,
    generateCode: generateCodeNow,
    exportWorkspace,
    loadWorkspace,
    clearWorkspace,
    exportCode,
    copyCode,
    parseCode,
    validateWorkspace,
    showExamples,
    showWorkflows,
    saveAsTemplate,
    
    // Performance monitoring
    getPerformanceMetrics: () => {
        return {
            cache: performanceCache ? performanceCache.getStats() : null,
            optimizer: performanceOptimizer ? performanceOptimizer.getMetrics() : null,
            toolbox: toolboxManager ? toolboxManager.getMetrics() : null
        };
    },
    logPerformanceMetrics: () => {
        console.log('=== Performance Metrics ===');
        if (performanceCache) {
            console.log('Cache Stats:');
            performanceCache.logStats();
        }
        if (performanceOptimizer) {
            console.log('Optimizer Stats:');
            performanceOptimizer.logMetrics();
        }
        if (toolboxManager) {
            console.log('Toolbox Stats:', toolboxManager.getMetrics());
        }
    },
    
    // Expose managers for debugging
    get workspace() { return workspace; },
    get modeManager() { return modeManager; },
    get workspaceManager() { return workspaceManager; },
    get toolboxManager() { return toolboxManager; },
    get multiFileGenerator() { return multiFileGenerator; },
    get referenceManager() { return referenceManager; },
    get errorHandler() { return errorHandler; },
    get validator() { return validator; },
    get performanceCache() { return performanceCache; },
    get performanceOptimizer() { return performanceOptimizer; },
    get currentMode() { return currentMode; },
    get currentFiles() { return currentFiles; }
};

console.log('[App] Application module loaded');


// ============================================================================
// RUST COMPILER INTEGRATION
// ============================================================================

/**
 * Check Rust code for compilation errors
 */
async function checkRustCode() {
    if (!rustCompiler) {
        showNotification('Rust compiler not initialized', 'error');
        return;
    }

    // Only check Rust and Bevy code
    if (currentMode !== 'rust' && currentMode !== 'bevy') {
        showNotification('Code checking is only available for Rust and Bevy modes', 'info');
        return;
    }

    // Get the current Rust code
    let rustCode = '';
    for (const [filename, code] of currentFiles.entries()) {
        if (filename.endsWith('.rs')) {
            rustCode += code + '\n\n';
        }
    }

    if (!rustCode.trim()) {
        showNotification('No Rust code to check', 'warning');
        return;
    }

    // Show checking notification
    const checkingNotif = showNotification('🔍 Checking code and validating alignment...', 'info', 0);

    try {
        // Run Rust compilation check
        const result = await rustCompiler.checkCode(rustCode);

        // Close checking notification
        closeNotification(checkingNotif);

        if (result.success) {
            showNotification('✓ Code compiled successfully!', 'success', 5000);
            
            // Clear any previous compilation errors
            if (errorHandler) {
                errorHandler.clearErrors();
            }
        } else {
            // Show compilation errors
            showCompilationErrors(result);
        }
        
        // Run struct alignment validation (always run, even if compilation fails)
        if (crossModeValidator && workspace) {
            const alignmentResults = crossModeValidator.validateWorkspace(workspace);
            
            if (alignmentResults.length > 0) {
                // Count valid and invalid
                const invalidCount = alignmentResults.filter(r => !r.valid).length;
                const warningCount = alignmentResults.filter(r => r.warnings.length > 0).length;
                
                if (invalidCount > 0) {
                    showNotification(
                        `⚠️ ${invalidCount} struct(s) have alignment issues`,
                        'warning',
                        8000
                    );
                    
                    // Show detailed errors for invalid structs
                    alignmentResults.forEach(alignResult => {
                        if (!alignResult.valid) {
                            showErrorNotification(
                                `Struct '${alignResult.structName}' alignment mismatch`,
                                {
                                    context: {
                                        structName: alignResult.structName,
                                        rustSize: alignResult.rustLayout?.totalSize,
                                        wgslSize: alignResult.wgslLayout?.totalSize
                                    },
                                    suggestions: alignResult.suggestions
                                },
                                0 // Persistent
                            );
                            
                            // Log to console
                            console.group(`⚖️ Struct '${alignResult.structName}' Alignment Issues`);
                            console.log(crossModeValidator.formatValidationResult(alignResult));
                            console.groupEnd();
                        }
                    });
                } else if (warningCount > 0) {
                    showNotification(
                        `⚖️ ${alignmentResults.length} struct(s) validated with ${warningCount} warning(s)`,
                        'info',
                        5000
                    );
                    
                    // Log warnings to console
                    alignmentResults.forEach(alignResult => {
                        if (alignResult.warnings.length > 0) {
                            console.group(`⚖️ Struct '${alignResult.structName}' Warnings`);
                            console.log(crossModeValidator.formatValidationResult(alignResult));
                            console.groupEnd();
                        }
                    });
                }
            }
        }
        
    } catch (error) {
        closeNotification(checkingNotif);
        console.error('[Rust Compiler] Check failed:', error);
        showNotification(
            'Compiler service unavailable. Using Rust Playground API as fallback...',
            'warning',
            3000
        );
    }
}

/**
 * Display compilation errors in the UI
 */
function showCompilationErrors(result) {
    const errorCount = result.errors.length;
    const warningCount = result.warnings.length;

    // Show summary notification
    let message = '';
    if (errorCount > 0) {
        message += `❌ ${errorCount} error${errorCount > 1 ? 's' : ''}`;
    }
    if (warningCount > 0) {
        if (message) message += ', ';
        message += `⚠️ ${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    }

    showNotification(message, 'error', 10000);

    // Display detailed errors in error panel
    if (errorHandler) {
        // Clear previous errors
        errorHandler.clearErrors();

        // Add compilation errors
        result.errors.forEach((error, index) => {
            errorHandler.showError(new Error(error.message), {
                type: 'compilation_error',
                blockId: null,
                suggestion: error.suggestion || 'Check the generated code for syntax errors',
                showNotification: true,
                context: {
                    line: error.line,
                    column: error.column,
                    file: error.file,
                    code: error.code
                }
            });
        });

        // Add warnings
        result.warnings.forEach((warning, index) => {
            errorHandler.showError(new Error(warning.message), {
                type: 'compilation_warning',
                blockId: null,
                suggestion: warning.suggestion || '',
                showNotification: true,
                context: {
                    line: warning.line,
                    column: warning.column,
                    file: warning.file
                }
            });
        });
    }

    // Also log to console for debugging
    console.group('🔍 Compilation Results');
    console.log('Success:', result.success);
    console.log('Errors:', result.errors);
    console.log('Warnings:', result.warnings);
    console.groupEnd();
}


