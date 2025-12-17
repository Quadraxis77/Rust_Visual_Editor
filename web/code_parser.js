// Code-to-Blocks Parser
// Parses code from multiple modes (Rust, WGSL, Bevy, Biospheres) and generates Blockly blocks

class MultiModeCodeParser {
    constructor(workspace) {
        this.workspace = workspace;
        this.blockIdCounter = 0;
        this.errors = [];
        this.references = new Map(); // Track cross-file references
        
        // Initialize mode-specific parsers
        this.rustParser = new RustParser(this);
        this.wgslParser = new WGSLParser(this);
        this.bevyParser = new BevyParser(this);
        this.biospheresParser = new BiospheresParser(this);
    }

    // Generate unique block ID
    generateBlockId() {
        return `block_${this.blockIdCounter++}`;
    }

    // Main parse function - detects mode and delegates to appropriate parser
    parse(code, mode = 'auto') {
        this.blockIdCounter = 0;
        this.errors = [];
        this.references.clear();
        
        console.log(`[MultiModeCodeParser] parse() called with mode: ${mode}, code length: ${code.length}`);
        console.log(`[MultiModeCodeParser] First 200 chars of code:`, code.substring(0, 200));
        
        try {
            // Auto-detect mode if not specified
            if (mode === 'auto') {
                mode = this.detectMode(code);
                console.log(`[MultiModeCodeParser] Auto-detected mode: ${mode}`);
            }
            
            // Check if code contains mixed modes
            if (mode === 'mixed' || this.containsMixedModes(code)) {
                console.log(`[MultiModeCodeParser] Detected mixed modes, using mixed parser`);
                return this.parseMixed(code);
            }
            
            // Delegate to appropriate parser
            let blocks;
            switch (mode) {
                case 'rust':
                    blocks = this.rustParser.parse(code);
                    break;
                case 'wgsl':
                    blocks = this.wgslParser.parse(code);
                    break;
                case 'bevy':
                    blocks = this.bevyParser.parse(code);
                    break;
                case 'biospheres':
                    blocks = this.biospheresParser.parse(code);
                    break;
                default:
                    this.addError(`Unknown mode: ${mode}`, 0, 0);
                    blocks = [];
            }
            
            console.log(`[MultiModeCodeParser] parse() returning ${blocks.length} blocks`);
            return blocks;
        } catch (error) {
            console.error('[MultiModeCodeParser] Parse error:', error);
            this.addError(`Parse error: ${error.message}`, 0, 0);
            return [];
        }
    }
    
    // Detect code mode based on content
    detectMode(code) {
        const modes = this.detectAllModes(code);
        
        // If multiple modes detected, return 'mixed'
        if (modes.length > 1) {
            return 'mixed';
        }
        
        // Return single detected mode or default to rust
        return modes.length === 1 ? modes[0] : 'rust';
    }
    
    // Detect all modes present in code
    detectAllModes(code) {
        const modes = new Set();
        
        // Check for WGSL-specific syntax
        if (code.includes('@compute') || code.includes('@vertex') || code.includes('@fragment') ||
            code.includes('var<storage>') || code.includes('var<uniform>')) {
            modes.add('wgsl');
        }
        
        // Check for Bevy-specific imports and types
        if (code.includes('use bevy::') || code.includes('Query<') || 
            code.includes('Commands') || code.includes('Res<') || code.includes('ResMut<')) {
            modes.add('bevy');
        }
        
        // Check for Biospheres-specific types
        if (code.includes('CellType') || code.includes('Genome') || 
            code.includes('AdhesionZone') || code.includes('SignalChannel') ||
            code.includes('emit_signal') || code.includes('contract_adhesions')) {
            modes.add('biospheres');
        }
        
        // Always include rust as base if no specific modes detected
        if (modes.size === 0) {
            modes.add('rust');
        }
        
        return Array.from(modes);
    }
    
    // Check if code contains mixed modes
    containsMixedModes(code) {
        const modes = this.detectAllModes(code);
        return modes.length > 1;
    }
    
    // Parse code with mixed modes
    parseMixed(code) {
        console.log(`[MultiModeCodeParser] Parsing mixed-mode code`);
        const blocks = [];
        
        // Try all parsers and collect blocks from each
        // Priority order: Bevy > WGSL > Rust
        // Note: Biospheres is just Rust/Bevy code, so we don't need a separate parser
        
        try {
            // Parse Bevy-specific constructs
            const bevyBlocks = this.bevyParser.parse(code);
            blocks.push(...bevyBlocks);
            console.log(`[MultiModeCodeParser] Found ${bevyBlocks.length} Bevy blocks`);
        } catch (error) {
            console.warn('[MultiModeCodeParser] Bevy parser error:', error);
        }
        
        // Only parse WGSL if we detect actual WGSL shader code
        // (not just Rust code that happens to have similar keywords)
        if (code.includes('@compute') || code.includes('@vertex') || code.includes('@fragment')) {
            try {
                // Parse WGSL-specific constructs
                const wgslBlocks = this.wgslParser.parse(code);
                blocks.push(...wgslBlocks);
                console.log(`[MultiModeCodeParser] Found ${wgslBlocks.length} WGSL blocks`);
            } catch (error) {
                console.warn('[MultiModeCodeParser] WGSL parser error:', error);
            }
        } else {
            console.log(`[MultiModeCodeParser] Skipping WGSL parser (no shader entry points detected)`);
        }
        
        try {
            // Parse general Rust constructs (catches everything else)
            const rustBlocks = this.rustParser.parse(code);
            // Filter out blocks that were already captured by more specific parsers
            const uniqueRustBlocks = this.filterDuplicateBlocks(rustBlocks, blocks);
            blocks.push(...uniqueRustBlocks);
            console.log(`[MultiModeCodeParser] Found ${uniqueRustBlocks.length} unique Rust blocks`);
        } catch (error) {
            console.warn('[MultiModeCodeParser] Rust parser error:', error);
        }
        
        console.log(`[MultiModeCodeParser] Mixed mode parsing complete: ${blocks.length} total blocks`);
        return blocks;
    }
    
    // Filter out duplicate blocks based on type and position
    filterDuplicateBlocks(newBlocks, existingBlocks) {
        const existingSignatures = new Set();
        
        // Create signatures for existing blocks
        for (const block of existingBlocks) {
            const signature = this.getBlockSignature(block);
            existingSignatures.add(signature);
        }
        
        // Filter new blocks
        return newBlocks.filter(block => {
            const signature = this.getBlockSignature(block);
            return !existingSignatures.has(signature);
        });
    }
    
    // Get a unique signature for a block
    getBlockSignature(block) {
        // Create signature based on type and key fields
        let signature = block.type;
        
        if (block.fields) {
            if (block.fields.NAME) signature += `_${block.fields.NAME}`;
            if (block.fields.PATH) signature += `_${block.fields.PATH}`;
        }
        
        return signature;
    }
    
    // Parse multiple files and preserve cross-file references
    parseMultipleFiles(files) {
        const results = new Map();
        
        // First pass: parse all files
        for (const [filename, code] of files.entries()) {
            const mode = this.detectModeFromFilename(filename);
            const blocks = this.parse(code, mode);
            results.set(filename, { mode, blocks });
        }
        
        // Second pass: detect and link cross-file references
        this.detectCrossFileReferences(results);
        
        return results;
    }
    
    // Detect mode from filename
    detectModeFromFilename(filename) {
        if (filename.endsWith('.wgsl')) return 'wgsl';
        if (filename.includes('system') || filename.includes('bevy')) return 'bevy';
        if (filename.includes('cell') || filename.includes('genome') || filename.includes('bio')) return 'biospheres';
        return 'rust';
    }
    
    // Detect cross-file references (imports, shader references, etc.)
    detectCrossFileReferences(fileResults) {
        for (const [filename, { blocks }] of fileResults.entries()) {
            this.scanBlocksForReferences(blocks, filename);
        }
    }
    
    // Recursively scan blocks for reference patterns
    scanBlocksForReferences(blocks, sourceFile) {
        for (const block of blocks) {
            // Check for use statements (imports)
            if (block.type === 'rust_use' || block.type === 'bevy_use') {
                const path = block.fields?.PATH || '';
                if (path.includes('::')) {
                    this.addReference(sourceFile, path, 'import');
                }
            }
            
            // Check for shader references in Bevy code
            if (block.type === 'bevy_shader_handle' || block.type === 'bevy_compute_pipeline') {
                const shaderPath = block.fields?.SHADER_PATH || '';
                if (shaderPath) {
                    this.addReference(sourceFile, shaderPath, 'shader');
                }
            }
            
            // Recursively check nested blocks
            if (block.values) {
                for (const valueBlock of Object.values(block.values)) {
                    if (valueBlock) {
                        this.scanBlocksForReferences([valueBlock], sourceFile);
                    }
                }
            }
            
            if (block.statements) {
                for (const stmtBlocks of Object.values(block.statements)) {
                    if (Array.isArray(stmtBlocks)) {
                        this.scanBlocksForReferences(stmtBlocks, sourceFile);
                    }
                }
            }
        }
    }
    
    // Add a cross-file reference
    addReference(sourceFile, targetPath, type) {
        if (!this.references.has(sourceFile)) {
            this.references.set(sourceFile, []);
        }
        this.references.get(sourceFile).push({ targetPath, type });
    }
    
    // Get all references for a file
    getReferences(filename) {
        return this.references.get(filename) || [];
    }
    
    // Add error with context
    addError(message, line, column, suggestion = null) {
        this.errors.push({
            message,
            line,
            column,
            suggestion,
            timestamp: Date.now()
        });
    }
    
    // Get all parsing errors
    getErrors() {
        return this.errors;
    }
    
    // Check if parsing had errors
    hasErrors() {
        return this.errors.length > 0;
    }
    
    // Convert parsed blocks to Blockly XML
    blocksToXml(blocks, filename = 'imported.rs') {
        console.log(`[MultiModeCodeParser] blocksToXml() called with ${blocks.length} blocks, filename: ${filename}`);
        
        let xml = '<xml xmlns="https://developers.google.com/blockly/xml">\n';
        
        // Wrap all blocks in a file container
        xml += '  <block type="file_container" x="20" y="20">\n';
        xml += `    <field name="FILENAME">${this.escapeXml(filename)}</field>\n`;
        
        if (blocks.length > 0) {
            xml += '    <statement name="CONTENTS">\n';
            
            // Recursively chain blocks with proper nesting
            xml += this.chainBlocks(blocks, 6);
            
            xml += '    </statement>\n';
        } else {
            console.warn('[MultiModeCodeParser] No blocks to add to file container!');
        }
        
        xml += '  </block>\n';
        xml += '</xml>';
        
        console.log('[MultiModeCodeParser] Generated XML length:', xml.length);
        return xml;
    }
    
    // Chain blocks together with <next> tags
    chainBlocks(blocks, indent) {
        if (blocks.length === 0) return '';
        
        const spaces = ' '.repeat(indent);
        let xml = '';
        
        // Generate the first block with next blocks nested inside
        xml += this.blockToXmlWithNext(blocks[0], blocks.slice(1), indent);
        
        return xml;
    }
    
    // Convert block to XML with next blocks nested inside
    blockToXmlWithNext(block, nextBlocks, indent) {
        const spaces = ' '.repeat(indent);
        let xml = `${spaces}<block type="${block.type}" id="${block.id}">\n`;
        
        // Add fields
        if (block.fields) {
            for (let [name, value] of Object.entries(block.fields)) {
                xml += `${spaces}  <field name="${name}">${this.escapeXml(value)}</field>\n`;
            }
        }
        
        // Add values
        if (block.values) {
            for (let [name, valueBlock] of Object.entries(block.values)) {
                if (valueBlock) {
                    xml += `${spaces}  <value name="${name}">\n`;
                    xml += this.blockToXml(valueBlock, indent + 4);
                    xml += `${spaces}  </value>\n`;
                }
            }
        }
        
        // Add statements
        if (block.statements) {
            for (let [name, stmtBlocks] of Object.entries(block.statements)) {
                if (stmtBlocks && stmtBlocks.length > 0) {
                    xml += `${spaces}  <statement name="${name}">\n`;
                    xml += this.chainBlocks(stmtBlocks, indent + 4);
                    xml += `${spaces}  </statement>\n`;
                }
            }
        }
        
        // Add next blocks INSIDE this block
        if (nextBlocks && nextBlocks.length > 0) {
            xml += `${spaces}  <next>\n`;
            xml += this.blockToXmlWithNext(nextBlocks[0], nextBlocks.slice(1), indent + 4);
            xml += `${spaces}  </next>\n`;
        }
        
        xml += `${spaces}</block>\n`;
        return xml;
    }

    // Convert single block to XML (for value blocks only, not statement chains)
    blockToXml(block, indent = 0) {
        const spaces = ' '.repeat(indent);
        let xml = `${spaces}<block type="${block.type}" id="${block.id}">\n`;
        
        // Add fields
        if (block.fields) {
            for (let [name, value] of Object.entries(block.fields)) {
                xml += `${spaces}  <field name="${name}">${this.escapeXml(value)}</field>\n`;
            }
        }
        
        // Add values (these are value inputs, not statement chains)
        if (block.values) {
            for (let [name, valueBlock] of Object.entries(block.values)) {
                if (valueBlock) {
                    xml += `${spaces}  <value name="${name}">\n`;
                    xml += this.blockToXml(valueBlock, indent + 4);
                    xml += `${spaces}  </value>\n`;
                }
            }
        }
        
        // Add statements (these need to be chained with <next> tags)
        if (block.statements) {
            for (let [name, stmtBlocks] of Object.entries(block.statements)) {
                if (stmtBlocks && stmtBlocks.length > 0) {
                    xml += `${spaces}  <statement name="${name}">\n`;
                    xml += this.chainBlocks(stmtBlocks, indent + 4);
                    xml += `${spaces}  </statement>\n`;
                }
            }
        }
        
        xml += `${spaces}</block>\n`;
        return xml;
    }

    // Escape XML special characters
    escapeXml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    // Load blocks into workspace
    loadIntoWorkspace(code, mode = 'auto') {
        const blocks = this.parse(code, mode);
        const xml = this.blocksToXml(blocks);
        const xmlDom = Blockly.utils.xml.textToDom(xml);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(xmlDom, this.workspace);
    }
    
    // Create a simple text block for unparsed content
    createTextBlock(text) {
        return {
            type: 'rust_var',
            id: this.generateBlockId(),
            fields: {
                NAME: text
            }
        };
    }

    // Create a parameters block
    createParametersBlock(params) {
        if (!params || params.trim() === '') return null;
        return {
            type: 'rust_parameters',
            id: this.generateBlockId(),
            fields: {
                PARAMS: params.trim()
            }
        };
    }

    // Create a return type block
    createReturnTypeBlock(returnType) {
        if (!returnType || returnType.trim() === '') return null;
        // Remove leading -> if present
        const cleanType = returnType.trim().replace(/^->\s*/, '');
        if (cleanType === '') return null;
        return {
            type: 'rust_return_type',
            id: this.generateBlockId(),
            fields: {
                TYPE: cleanType
            }
        };
    }
}


// ============================================================================
// Rust Parser - Handles general Rust code
// ============================================================================
class RustParser {
    constructor(parent) {
        this.parent = parent;
    }
    
    parse(code) {
        console.log('[RustParser] parse() called, code length:', code.length);
        const blocks = [];
        
        try {
            // Parse top-level constructs
            console.log('[RustParser] Parsing use statements...');
            const useBlocks = this.parseUseStatements(code);
            console.log('[RustParser] Found', useBlocks.length, 'use statements');
            
            console.log('[RustParser] Parsing functions...');
            const functionBlocks = this.parseFunctions(code);
            console.log('[RustParser] Found', functionBlocks.length, 'functions');
            
            console.log('[RustParser] Parsing impls...');
            const implBlocks = this.parseImpls(code);
            console.log('[RustParser] Found', implBlocks.length, 'impls');
            
            console.log('[RustParser] Parsing structs...');
            const structBlocks = this.parseStructs(code);
            console.log('[RustParser] Found', structBlocks.length, 'structs');
            
            blocks.push(...useBlocks);
            blocks.push(...functionBlocks);
            blocks.push(...implBlocks);
            blocks.push(...structBlocks);
            
            console.log(`[RustParser] Total parsed: ${blocks.length} blocks`);
            
            // If no blocks were parsed, create a comment block with the code
            if (blocks.length === 0) {
                blocks.push({
                    type: 'rust_comment',
                    id: this.parent.generateBlockId(),
                    fields: {
                        TEXT: 'Imported code (could not parse):\n' + code.substring(0, 500) + (code.length > 500 ? '...' : '')
                    }
                });
            }
        } catch (error) {
            this.parent.addError(`Rust parse error: ${error.message}`, 0, 0, 'Check Rust syntax');
            console.error('[RustParser] Parse error:', error);
        }
        
        return blocks;
    }
    
    // Parse use statements
    parseUseStatements(code) {
        const blocks = [];
        // Match use statements at the start of a line (after optional whitespace)
        // This avoids matching "use" in comments or other contexts
        const useRegex = /^\s*use\s+([^;]+);/gm;
        let match;
        
        while ((match = useRegex.exec(code)) !== null) {
            const path = match[1].trim();
            // Skip if the path contains comment markers (shouldn't happen with line-start matching, but safety check)
            if (path.includes('//') || path.includes('/*')) {
                continue;
            }
            console.log('[RustParser] Found use statement:', path);
            blocks.push({
                type: 'rust_use',
                id: this.parent.generateBlockId(),
                fields: {
                    PATH: path
                }
            });
        }
        
        console.log(`[RustParser] parseUseStatements returning ${blocks.length} blocks`);
        return blocks;
    }

    // Parse function definitions
    parseFunctions(code) {
        const blocks = [];
        
        // Use a more robust approach to find functions with balanced braces
        const functions = this.extractFunctions(code);
        
        for (const func of functions) {
            if (func.name === 'main' && func.params === '') {
                blocks.push({
                    type: 'rust_main',
                    id: this.parent.generateBlockId(),
                    statements: {
                        BODY: this.parseStatements(func.body)
                    }
                });
            } else {
                // Use rust_pub_function for pub functions, rust_function for private
                const blockType = func.visibility === 'pub' ? 'rust_pub_function' : 'rust_function';
                blocks.push({
                    type: blockType,
                    id: this.parent.generateBlockId(),
                    fields: {
                        NAME: func.name
                    },
                    values: {
                        PARAMS_OPTIONAL: this.parent.createParametersBlock(func.params),
                        RETURN_TYPE_OPTIONAL: this.parent.createReturnTypeBlock(func.returnType)
                    },
                    statements: {
                        BODY: this.parseStatements(func.body)
                    }
                });
            }
        }
        
        return blocks;
    }
    
    // Extract functions with balanced brace matching
    extractFunctions(code) {
        const functions = [];
        const fnRegex = /(pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^{]+))?\s*\{/g;
        let match;
        let matchCount = 0;
        const MAX_MATCHES = 100; // Prevent infinite loops
        
        while ((match = fnRegex.exec(code)) !== null && matchCount < MAX_MATCHES) {
            matchCount++;
            const visibility = match[1] ? match[1].trim() : '';
            const name = match[2];
            const params = match[3].trim();
            const returnType = match[4] ? match[4].trim() : '';
            const bodyStart = match.index + match[0].length;
            
            console.log(`[RustParser] Found function: ${name}(${params})`);
            
            // Find matching closing brace
            const body = this.extractBalancedBraces(code, bodyStart - 1);
            
            if (body !== null) {
                console.log(`[RustParser] Extracted body for ${name}, length: ${body.length}`);
                functions.push({
                    visibility,
                    name,
                    params,
                    returnType,
                    body
                });
            } else {
                console.warn(`[RustParser] Could not extract body for ${name}`);
            }
        }
        
        console.log(`[RustParser] extractFunctions returning ${functions.length} functions (${matchCount} matches processed)`);
        return functions;
    }
    
    // Extract content between balanced braces
    extractBalancedBraces(code, startPos) {
        let braceCount = 0;
        let inString = false;
        let inChar = false;
        let escaped = false;
        let start = -1;
        
        for (let i = startPos; i < code.length; i++) {
            const char = code[i];
            const prevChar = i > 0 ? code[i - 1] : '';
            
            // Handle escape sequences
            if (escaped) {
                escaped = false;
                continue;
            }
            if (char === '\\') {
                escaped = true;
                continue;
            }
            
            // Handle strings and chars
            if (char === '"' && !inChar) {
                inString = !inString;
                continue;
            }
            if (char === "'" && !inString && prevChar !== '&') {
                inChar = !inChar;
                continue;
            }
            
            if (inString || inChar) continue;
            
            // Count braces
            if (char === '{') {
                if (braceCount === 0) start = i + 1;
                braceCount++;
            } else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    return code.substring(start, i);
                }
            }
        }
        
        return null;
    }


    // Parse impl blocks
    parseImpls(code) {
        const blocks = [];
        const implRegex = /impl\s+(\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        let match;
        
        while ((match = implRegex.exec(code)) !== null) {
            blocks.push({
                type: 'rust_impl',
                id: this.parent.generateBlockId(),
                fields: {
                    TYPE: match[1]
                },
                statements: {
                    METHODS: this.parseStatements(match[2])
                }
            });
        }
        
        return blocks;
    }

    // Parse structs
    parseStructs(code) {
        const blocks = [];
        // Match structs with optional attributes and visibility
        const structRegex = /(?:#\[derive\(([^)]+)\)\]\s*)?(pub\s+)?struct\s+(\w+)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = structRegex.exec(code)) !== null) {
            const derives = match[1] || '';
            const name = match[3];
            const fieldsText = match[4].trim();
            
            // Parse individual fields
            const fieldBlocks = this.parseStructFields(fieldsText);
            
            blocks.push({
                type: 'rust_struct',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: name,
                    DERIVES: derives
                },
                statements: {
                    FIELDS: fieldBlocks
                }
            });
        }
        
        return blocks;
    }

    // Parse struct fields
    parseStructFields(fieldsText) {
        const fields = [];
        // Split by comma, handling potential nested types
        const fieldLines = fieldsText.split(',').map(f => f.trim()).filter(f => f);
        
        for (const line of fieldLines) {
            // Match: pub? name: type
            const match = line.match(/^(pub\s+)?(\w+)\s*:\s*(.+)$/);
            if (match) {
                fields.push({
                    type: 'rust_field',
                    id: this.parent.generateBlockId(),
                    fields: {
                        NAME: match[2],
                        TYPE: match[3].trim()
                    }
                });
            }
        }
        
        return fields;
    }

    // Parse statements within a block
    parseStatements(code) {
        const statements = [];
        
        // Don't split by lines - parse as a whole to handle multi-line constructs
        code = code.trim();
        let i = 0;
        
        while (i < code.length) {
            // Skip whitespace
            while (i < code.length && /\s/.test(code[i])) i++;
            if (i >= code.length) break;
            
            // Try to parse different statement types
            let stmt = null;
            let consumed = 0;
            
            // If statement
            if (code.substr(i, 2) === 'if') {
                const result = this.parseIfStatement(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            // While loop
            else if (code.substr(i, 5) === 'while') {
                const result = this.parseWhileLoop(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            // For loop
            else if (code.substr(i, 3) === 'for') {
                const result = this.parseForLoop(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            // Let binding
            else if (code.substr(i, 3) === 'let') {
                const result = this.parseLetBindingFull(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            // Return statement
            else if (code.substr(i, 6) === 'return') {
                const result = this.parseReturnFull(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            // Expression statement (ends with semicolon)
            else {
                const result = this.parseExpressionStatement(code.substr(i));
                if (result) {
                    stmt = result.block;
                    consumed = result.length;
                }
            }
            
            if (stmt) {
                statements.push(stmt);
                i += consumed;
            } else {
                // Check if there's remaining code that could be an implicit return
                const remaining = code.substr(i).trim();
                if (remaining && !remaining.startsWith('}')) {
                    // Treat as implicit return (expression without semicolon)
                    statements.push({
                        type: 'rust_return',
                        id: this.parent.generateBlockId(),
                        values: {
                            VALUE: this.parent.createTextBlock(remaining)
                        }
                    });
                    break;
                }
                
                // Skip to next semicolon or brace if we can't parse
                const nextSemi = code.indexOf(';', i);
                const nextBrace = code.indexOf('}', i);
                if (nextSemi !== -1 && (nextBrace === -1 || nextSemi < nextBrace)) {
                    i = nextSemi + 1;
                } else {
                    break;
                }
            }
        }
        
        return statements;
    }


    // Parse let binding
    parseLetBinding(line) {
        const mutMatch = line.match(/let\s+(mut\s+)?(\w+)(?:\s*:\s*([^=]+))?\s*=\s*(.+);/);
        if (mutMatch) {
            return {
                type: 'rust_let_binding',
                id: this.parent.generateBlockId(),
                fields: {
                    MUTABLE: mutMatch[1] ? 'TRUE' : 'FALSE',
                    NAME: mutMatch[2]
                },
                values: {
                    TYPE: mutMatch[3] ? this.parent.createTextBlock(`: ${mutMatch[3].trim()}`) : null,
                    VALUE: this.parent.createTextBlock(mutMatch[4].trim())
                }
            };
        }
        return null;
    }

    // Parse return statement
    parseReturn(line) {
        const match = line.match(/return\s+(.+);/);
        if (match) {
            return {
                type: 'rust_return',
                id: this.parent.generateBlockId(),
                values: {
                    VALUE: this.parent.createTextBlock(match[1].trim())
                }
            };
        }
        return null;
    }

    // Parse println! macro
    parsePrintln(line) {
        const match = line.match(/println!\((.+)\);/);
        if (match) {
            return {
                type: 'rust_println',
                id: this.parent.generateBlockId(),
                values: {
                    MESSAGE: this.parent.createTextBlock(match[1].trim())
                }
            };
        }
        return null;
    }

    // Helper: Find matching closing brace
    findMatchingBrace(code, startIdx = 0) {
        let depth = 0;
        for (let i = startIdx; i < code.length; i++) {
            if (code[i] === '{') depth++;
            else if (code[i] === '}') {
                depth--;
                if (depth === 0) return i;
            }
        }
        return -1;
    }

    // Parse if statement with full structure
    parseIfStatement(code) {
        const match = code.match(/^if\s+(.+?)\s*\{/);
        if (!match) return null;
        
        const condition = match[1].trim();
        const bodyStart = code.indexOf('{');
        const bodyEnd = this.findMatchingBrace(code, bodyStart);
        
        if (bodyEnd === -1) return null;
        
        const body = code.substring(bodyStart + 1, bodyEnd);
        const totalLength = bodyEnd + 1;
        
        return {
            block: {
                type: 'rust_if',
                id: this.parent.generateBlockId(),
                values: {
                    CONDITION: this.parent.createTextBlock(condition)
                },
                statements: {
                    THEN: this.parseStatements(body)
                }
            },
            length: totalLength
        };
    }

    // Parse while loop
    parseWhileLoop(code) {
        const match = code.match(/^while\s+(.+?)\s*\{/);
        if (!match) return null;
        
        const condition = match[1].trim();
        const bodyStart = code.indexOf('{');
        const bodyEnd = this.findMatchingBrace(code, bodyStart);
        
        if (bodyEnd === -1) return null;
        
        const body = code.substring(bodyStart + 1, bodyEnd);
        const totalLength = bodyEnd + 1;
        
        return {
            block: {
                type: 'rust_while',
                id: this.parent.generateBlockId(),
                values: {
                    CONDITION: this.parent.createTextBlock(condition)
                },
                statements: {
                    BODY: this.parseStatements(body)
                }
            },
            length: totalLength
        };
    }

    // Parse for loop
    parseForLoop(code) {
        const match = code.match(/^for\s+(\w+)\s+in\s+(.+?)\s*\{/);
        if (!match) return null;
        
        const variable = match[1];
        const iterator = match[2].trim();
        const bodyStart = code.indexOf('{');
        const bodyEnd = this.findMatchingBrace(code, bodyStart);
        
        if (bodyEnd === -1) return null;
        
        const body = code.substring(bodyStart + 1, bodyEnd);
        const totalLength = bodyEnd + 1;
        
        return {
            block: {
                type: 'rust_for',
                id: this.parent.generateBlockId(),
                fields: {
                    VAR: variable
                },
                values: {
                    ITERATOR: this.parent.createTextBlock(iterator)
                },
                statements: {
                    BODY: this.parseStatements(body)
                }
            },
            length: totalLength
        };
    }

    // Parse let binding (full version with semicolon detection)
    parseLetBindingFull(code) {
        const match = code.match(/^let\s+(mut\s+)?(\w+)(?:\s*:\s*([^=]+))?\s*=\s*([^;]+);/);
        if (!match) return null;
        
        return {
            block: {
                type: 'rust_let_binding',
                id: this.parent.generateBlockId(),
                fields: {
                    MUTABLE: match[1] ? 'TRUE' : 'FALSE',
                    NAME: match[2]
                },
                values: {
                    TYPE: match[3] ? this.parent.createTextBlock(`: ${match[3].trim()}`) : null,
                    VALUE: this.parent.createTextBlock(match[4].trim())
                }
            },
            length: match[0].length
        };
    }

    // Parse return statement (full version)
    parseReturnFull(code) {
        const match = code.match(/^return\s+([^;]+);/);
        if (!match) return null;
        
        return {
            block: {
                type: 'rust_return',
                id: this.parent.generateBlockId(),
                values: {
                    VALUE: this.parent.createTextBlock(match[1].trim())
                }
            },
            length: match[0].length
        };
    }

    // Parse expression statement
    parseExpressionStatement(code) {
        const match = code.match(/^([^;]+);/);
        if (!match) return null;
        
        const expr = match[1].trim();
        
        // Check for specific patterns
        if (expr.startsWith('println!')) {
            const printMatch = expr.match(/println!\((.+)\)$/);
            if (printMatch) {
                return {
                    block: {
                        type: 'rust_println',
                        id: this.parent.generateBlockId(),
                        values: {
                            MESSAGE: this.parent.createTextBlock(printMatch[1].trim())
                        }
                    },
                    length: match[0].length
                };
            }
        }
        
        // Assignment
        if (expr.includes('=') && !expr.includes('==') && !expr.includes('!=') && !expr.includes('<=') && !expr.includes('>=')) {
            const assignMatch = expr.match(/^(\w+)\s*=\s*(.+)$/);
            if (assignMatch) {
                return {
                    block: {
                        type: 'rust_assign',
                        id: this.parent.generateBlockId(),
                        fields: {
                            VAR: assignMatch[1]
                        },
                        values: {
                            VALUE: this.parent.createTextBlock(assignMatch[2].trim())
                        }
                    },
                    length: match[0].length
                };
            }
        }
        
        // Generic expression statement
        return {
            block: {
                type: 'rust_expr_stmt',
                id: this.parent.generateBlockId(),
                values: {
                    EXPR: this.parent.createTextBlock(expr)
                }
            },
            length: match[0].length
        };
    }
}


// ============================================================================
// WGSL Parser - Handles WGSL shader code
// ============================================================================
class WGSLParser {
    constructor(parent) {
        this.parent = parent;
    }
    
    parse(code) {
        const blocks = [];
        
        try {
            // Parse WGSL constructs
            blocks.push(...this.parseStructs(code));
            blocks.push(...this.parseFunctions(code));
            blocks.push(...this.parseVariables(code));
        } catch (error) {
            this.parent.addError(`WGSL parse error: ${error.message}`, 0, 0, 'Check WGSL syntax');
        }
        
        return blocks;
    }
    
    // Parse WGSL structs
    parseStructs(code) {
        const blocks = [];
        const structRegex = /struct\s+(\w+)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = structRegex.exec(code)) !== null) {
            blocks.push({
                type: 'wgsl_struct',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[1]
                },
                values: {
                    FIELDS: this.parent.createTextBlock(match[2].trim())
                }
            });
        }
        
        return blocks;
    }
    
    // Parse WGSL functions (including entry points)
    parseFunctions(code) {
        const blocks = [];
        
        // Match @compute, @vertex, @fragment entry points
        const entryRegex = /@(compute|vertex|fragment)(?:\s+@workgroup_size\(([^)]+)\))?\s+fn\s+(\w+)\(([^)]*)\)(?:\s*->\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        let match;
        
        while ((match = entryRegex.exec(code)) !== null) {
            blocks.push({
                type: `wgsl_${match[1]}_shader`,
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[3],
                    WORKGROUP_SIZE: match[2] || ''
                },
                values: {
                    PARAMS: match[4] ? this.parent.createTextBlock(match[4].trim()) : null,
                    RETURN_TYPE: match[5] ? this.parent.createTextBlock(match[5].trim()) : null
                },
                statements: {
                    BODY: this.parseStatements(match[6])
                }
            });
        }
        
        // Match regular functions
        const fnRegex = /fn\s+(\w+)\(([^)]*)\)(?:\s*->\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        
        while ((match = fnRegex.exec(code)) !== null) {
            // Skip if already matched as entry point
            if (code.substring(Math.max(0, match.index - 50), match.index).includes('@')) {
                continue;
            }
            
            blocks.push({
                type: 'wgsl_function',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[1]
                },
                values: {
                    PARAMS: match[2] ? this.parent.createTextBlock(match[2].trim()) : null,
                    RETURN_TYPE: match[3] ? this.parent.createTextBlock(match[3].trim()) : null
                },
                statements: {
                    BODY: this.parseStatements(match[4])
                }
            });
        }
        
        return blocks;
    }

    
    // Parse WGSL variables (storage, uniform, etc.)
    parseVariables(code) {
        const blocks = [];
        const varRegex = /var<(storage|uniform|private|workgroup)(?:,\s*(\w+))?>(?:\s+@group\((\d+)\)\s+@binding\((\d+)\))?\s+(\w+)\s*:\s*([^;]+);/g;
        let match;
        
        while ((match = varRegex.exec(code)) !== null) {
            blocks.push({
                type: 'wgsl_var',
                id: this.parent.generateBlockId(),
                fields: {
                    STORAGE_CLASS: match[1],
                    ACCESS_MODE: match[2] || '',
                    GROUP: match[3] || '',
                    BINDING: match[4] || '',
                    NAME: match[5],
                    TYPE: match[6].trim()
                }
            });
        }
        
        return blocks;
    }
    
    // Parse WGSL statements
    parseStatements(code) {
        const statements = [];
        const lines = code.split('\n').map(l => l.trim()).filter(l => l);
        
        for (let line of lines) {
            try {
                if (line.startsWith('let ') || line.startsWith('var ')) {
                    statements.push(this.parseVarDecl(line));
                } else if (line.startsWith('return ')) {
                    statements.push(this.parseReturn(line));
                } else if (line.endsWith(';')) {
                    statements.push({
                        type: 'wgsl_expr_stmt',
                        id: this.parent.generateBlockId(),
                        values: {
                            EXPR: this.parent.createTextBlock(line.slice(0, -1))
                        }
                    });
                }
            } catch (error) {
                this.parent.addError(`WGSL statement parse error: ${error.message}`, 0, 0);
            }
        }
        
        return statements;
    }
    
    // Parse variable declaration
    parseVarDecl(line) {
        const match = line.match(/(let|var)\s+(\w+)(?:\s*:\s*([^=]+))?\s*=\s*(.+);/);
        if (match) {
            return {
                type: 'wgsl_var_decl',
                id: this.parent.generateBlockId(),
                fields: {
                    KIND: match[1],
                    NAME: match[2],
                    TYPE: match[3] ? match[3].trim() : ''
                },
                values: {
                    VALUE: this.parent.createTextBlock(match[4].trim())
                }
            };
        }
        return null;
    }
    
    // Parse return statement
    parseReturn(line) {
        const match = line.match(/return\s+(.+);/);
        if (match) {
            return {
                type: 'wgsl_return',
                id: this.parent.generateBlockId(),
                values: {
                    VALUE: this.parent.createTextBlock(match[1].trim())
                }
            };
        }
        return null;
    }
}


// ============================================================================
// Bevy Parser - Handles Bevy ECS system code
// ============================================================================
class BevyParser {
    constructor(parent) {
        this.parent = parent;
    }
    
    parse(code) {
        const blocks = [];
        
        try {
            // Parse Bevy-specific constructs
            blocks.push(...this.parseUseStatements(code));
            blocks.push(...this.parseSystems(code));
            blocks.push(...this.parseComponents(code));
            blocks.push(...this.parseResources(code));
        } catch (error) {
            this.parent.addError(`Bevy parse error: ${error.message}`, 0, 0, 'Check Bevy ECS syntax');
        }
        
        return blocks;
    }
    
    // Parse use statements
    parseUseStatements(code) {
        const blocks = [];
        const useRegex = /use\s+([^;]+);/g;
        let match;
        
        while ((match = useRegex.exec(code)) !== null) {
            blocks.push({
                type: 'bevy_use',
                id: this.parent.generateBlockId(),
                fields: {
                    PATH: match[1].trim()
                }
            });
        }
        
        return blocks;
    }
    
    // Parse Bevy systems
    parseSystems(code) {
        const blocks = [];
        
        // Match system functions with Query parameters
        const systemRegex = /(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*(?:Query|Commands|Res|ResMut)[^)]*)\)(?:\s*->\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        let match;
        
        while ((match = systemRegex.exec(code)) !== null) {
            blocks.push({
                type: 'bevy_system',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[1]
                },
                values: {
                    PARAMS: this.parent.createParametersBlock(match[2]),
                    RETURN_TYPE: this.parent.createReturnTypeBlock(match[3])
                },
                statements: {
                    BODY: this.parseStatements(match[4])
                }
            });
        }
        
        return blocks;
    }
    
    // Parse Bevy components
    parseComponents(code) {
        const blocks = [];
        const componentRegex = /#\[derive\([^)]*Component[^)]*\)\]\s*(?:pub\s+)?struct\s+(\w+)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = componentRegex.exec(code)) !== null) {
            blocks.push({
                type: 'bevy_component',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[1]
                },
                values: {
                    FIELDS: this.parent.createTextBlock(match[2].trim())
                }
            });
        }
        
        return blocks;
    }
    
    // Parse Bevy resources
    parseResources(code) {
        const blocks = [];
        const resourceRegex = /#\[derive\([^)]*Resource[^)]*\)\]\s*(?:pub\s+)?struct\s+(\w+)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = resourceRegex.exec(code)) !== null) {
            blocks.push({
                type: 'bevy_resource',
                id: this.parent.generateBlockId(),
                fields: {
                    NAME: match[1]
                },
                values: {
                    FIELDS: this.parent.createTextBlock(match[2].trim())
                }
            });
        }
        
        return blocks;
    }
    
    // Parse statements (delegate to Rust parser)
    parseStatements(code) {
        // Bevy code is just Rust code, so use the Rust parser
        return this.parent.rustParser.parseStatements(code);
    }
}


// ============================================================================
// Biospheres Parser - Handles Biospheres cell biology code
// ============================================================================
class BiospheresParser {
    constructor(parent) {
        this.parent = parent;
    }
    
    parse(code) {
        const blocks = [];
        
        try {
            // Parse Biospheres-specific constructs
            blocks.push(...this.parseUseStatements(code));
            blocks.push(...this.parseCellTypes(code));
            blocks.push(...this.parseCellBehaviors(code));
            blocks.push(...this.parseGenomeOperations(code));
        } catch (error) {
            this.parent.addError(`Biospheres parse error: ${error.message}`, 0, 0, 'Check Biospheres syntax');
        }
        
        return blocks;
    }
    
    // Parse use statements
    parseUseStatements(code) {
        const blocks = [];
        const useRegex = /use\s+([^;]+);/g;
        let match;
        
        while ((match = useRegex.exec(code)) !== null) {
            blocks.push({
                type: 'rust_use',
                id: this.parent.generateBlockId(),
                fields: {
                    PATH: match[1].trim()
                }
            });
        }
        
        return blocks;
    }
    
    // Parse cell type components
    parseCellTypes(code) {
        const blocks = [];
        const cellTypeRegex = /#\[derive\([^)]*Component[^)]*\)\]\s*pub\s+struct\s+(\w+)\s*\{([^}]+)\}/g;
        let match;
        
        while ((match = cellTypeRegex.exec(code)) !== null) {
            // Check if it's a cell-related component
            const name = match[1];
            if (name.includes('Cell') || name.includes('Type') || code.substring(0, match.index).includes('cell')) {
                blocks.push({
                    type: 'bevy_derive_component',
                    id: this.parent.generateBlockId(),
                    fields: {
                        NAME: name
                    },
                    values: {
                        FIELDS: this.parent.createTextBlock(match[2].trim())
                    }
                });
            }
        }
        
        return blocks;
    }
    
    // Parse cell behavior systems
    parseCellBehaviors(code) {
        const blocks = [];
        
        // Match functions that use cell-specific operations
        const behaviorRegex = /(?:pub\s+)?fn\s+(\w+)\s*\(([^)]*)\)(?:\s*->\s*([^{]+))?\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        let match;
        
        while ((match = behaviorRegex.exec(code)) !== null) {
            const body = match[4];
            
            // Check if function contains cell-specific operations
            if (body.includes('emit_signal') || body.includes('contract_adhesions') || 
                body.includes('apply_thrust') || body.includes('CellType') ||
                body.includes('Genome') || body.includes('AdhesionZone')) {
                
                blocks.push({
                    type: 'bevy_system',
                    id: this.parent.generateBlockId(),
                    fields: {
                        NAME: match[1]
                    },
                    values: {
                        PARAMS: this.parent.createParametersBlock(match[2])
                    },
                    statements: {
                        BODY: this.parseStatements(body)
                    }
                });
            }
        }
        
        return blocks;
    }
    
    // Parse genome operations
    parseGenomeOperations(code) {
        const blocks = [];
        
        // Look for genome-related function calls
        const genomeRegex = /(\w+)\.get_genome\(\)|inject_genome\([^)]+\)|get_mode\([^)]+\)/g;
        let match;
        
        while ((match = genomeRegex.exec(code)) !== null) {
            // Parse as a generic Rust statement
            const statements = this.parent.rustParser.parseStatements(match[0]);
            blocks.push(...statements);
        }
        
        return blocks;
    }
    
    // Parse statements with cell-specific operations
    parseStatements(code) {
        const statements = [];
        const lines = code.split('\n').map(l => l.trim()).filter(l => l);
        
        for (let line of lines) {
            try {
                // Parse cell-specific operations
                if (line.includes('emit_signal')) {
                    statements.push(this.parseEmitSignal(line));
                } else if (line.includes('contract_adhesions')) {
                    statements.push(this.parseContractAdhesions(line));
                } else if (line.includes('apply_thrust') || line.includes('forces.force')) {
                    statements.push(this.parseApplyThrust(line));
                } else if (line.endsWith(';')) {
                    // Parse as generic Rust statement
                    const parsed = this.parent.rustParser.parseStatements(line);
                    if (parsed.length > 0) {
                        statements.push(...parsed);
                    } else {
                        // Fallback to text block if can't parse
                        statements.push(this.parent.createTextBlock(line));
                    }
                }
            } catch (error) {
                this.parent.addError(`Biospheres statement parse error: ${error.message}`, 0, 0);
            }
        }
        
        return statements;
    }
    
    // Parse emit_signal operation
    parseEmitSignal(line) {
        // Parse as a function call
        const parsed = this.parent.rustParser.parseStatements(line);
        if (parsed.length > 0) {
            return parsed[0];
        }
        return this.parent.createTextBlock(line);
    }
    
    // Parse contract_adhesions operation
    parseContractAdhesions(line) {
        // Parse as a function call
        const parsed = this.parent.rustParser.parseStatements(line);
        if (parsed.length > 0) {
            return parsed[0];
        }
        return this.parent.createTextBlock(line);
    }
    
    // Parse apply_thrust operation
    parseApplyThrust(line) {
        // Parse as an assignment/expression
        const parsed = this.parent.rustParser.parseStatements(line);
        if (parsed.length > 0) {
            return parsed[0];
        }
        return this.parent.createTextBlock(line);
    }
}

// Maintain backward compatibility with old class name
class RustCodeParser extends MultiModeCodeParser {}
