/**
 * Rust Compiler Client
 * 
 * Provides integration with Rust compiler for real-time error checking
 * Supports both local service and Rust Playground API
 */

class RustCompilerClient {
    /**
     * Create a new Rust compiler client
     * @param {Object} options - Configuration options
     * @param {string} options.serviceUrl - URL of local compiler service (default: http://localhost:3030)
     * @param {boolean} options.usePlayground - Use Rust Playground API as fallback (default: true)
     * @param {boolean} options.quickCheck - Use quick syntax checking (default: false)
     */
    constructor(options = {}) {
        this.serviceUrl = options.serviceUrl || 'http://localhost:3030';
        this.usePlayground = options.usePlayground !== false;
        this.quickCheck = options.quickCheck || false;
        this.serviceAvailable = null; // null = unknown, true/false = known
        
        // Check service availability on init
        this.checkServiceAvailability();
    }

    /**
     * Check if local compiler service is available
     */
    async checkServiceAvailability() {
        try {
            const response = await fetch(`${this.serviceUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(2000) // 2 second timeout
            });
            
            if (response.ok) {
                const data = await response.json();
                this.serviceAvailable = data.rust_available === true;
                console.log('[Rust Compiler] Local service available:', this.serviceAvailable);
                return this.serviceAvailable;
            }
        } catch (error) {
            console.log('[Rust Compiler] Local service not available:', error.message);
            this.serviceAvailable = false;
        }
        
        return false;
    }

    /**
     * Check Rust code for compilation errors
     * @param {string} code - Rust code to check
     * @param {Object} options - Check options
     * @param {Array} options.dependencies - Array of {name, version} dependencies
     * @param {boolean} options.quickCheck - Override quick check setting
     * @returns {Promise<CompilationResult>}
     */
    async checkCode(code, options = {}) {
        // Try local service first
        if (this.serviceAvailable !== false) {
            try {
                const result = await this.checkWithLocalService(code, options);
                if (result) {
                    return result;
                }
            } catch (error) {
                console.warn('[Rust Compiler] Local service failed:', error);
                this.serviceAvailable = false;
            }
        }

        // Fallback to Rust Playground API
        if (this.usePlayground) {
            try {
                return await this.checkWithPlayground(code, options);
            } catch (error) {
                console.error('[Rust Compiler] Playground API failed:', error);
                throw new Error('No compiler service available');
            }
        }

        throw new Error('Rust compiler service not available');
    }

    /**
     * Check code using local compiler service
     * @private
     */
    async checkWithLocalService(code, options = {}) {
        const response = await fetch(`${this.serviceUrl}/check`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                dependencies: options.dependencies || [],
                quick_check: options.quickCheck !== undefined ? options.quickCheck : this.quickCheck
            }),
            signal: AbortSignal.timeout(30000) // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeResult(data.result);
    }

    /**
     * Check code using Rust Playground API
     * @private
     */
    async checkWithPlayground(code, options = {}) {
        // Rust Playground API endpoint
        const playgroundUrl = 'https://play.rust-lang.org/execute';

        const response = await fetch(playgroundUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                channel: 'stable',
                mode: 'debug',
                edition: '2021',
                crateType: 'bin',
                tests: false,
                code: code,
                backtrace: false
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!response.ok) {
            throw new Error(`Playground returned ${response.status}`);
        }

        const data = await response.json();
        return this.parsePlaygroundResult(data);
    }

    /**
     * Parse Rust Playground API response
     * @private
     */
    parsePlaygroundResult(data) {
        const errors = [];
        const warnings = [];

        // Parse stderr for errors and warnings
        if (data.stderr) {
            const lines = data.stderr.split('\n');
            let currentError = null;

            for (const line of lines) {
                // Match error/warning lines
                const errorMatch = line.match(/^error(\[E\d+\])?:/);
                const warningMatch = line.match(/^warning:/);
                const locationMatch = line.match(/-->\s+(.+):(\d+):(\d+)/);

                if (errorMatch || warningMatch) {
                    if (currentError) {
                        (currentError.level === 'error' ? errors : warnings).push(currentError);
                    }

                    currentError = {
                        level: errorMatch ? 'error' : 'warning',
                        message: line,
                        code: errorMatch ? errorMatch[1] : null,
                        line: null,
                        column: null,
                        file: null,
                        suggestion: null
                    };
                } else if (locationMatch && currentError) {
                    currentError.file = locationMatch[1];
                    currentError.line = parseInt(locationMatch[2]);
                    currentError.column = parseInt(locationMatch[3]);
                } else if (currentError && line.trim()) {
                    currentError.message += '\n' + line;
                }
            }

            if (currentError) {
                (currentError.level === 'error' ? errors : warnings).push(currentError);
            }
        }

        return {
            success: data.success && errors.length === 0,
            errors: errors,
            warnings: warnings,
            stdout: data.stdout || '',
            stderr: data.stderr || ''
        };
    }

    /**
     * Normalize compilation result format
     * @private
     */
    normalizeResult(result) {
        return {
            success: result.success,
            errors: result.errors || [],
            warnings: result.warnings || [],
            stdout: result.stdout || '',
            stderr: result.stderr || ''
        };
    }

    /**
     * Format errors for display
     * @param {CompilationResult} result
     * @returns {string} Formatted error message
     */
    formatErrors(result) {
        if (result.success) {
            return '✓ Code compiled successfully!';
        }

        let output = '';

        if (result.errors.length > 0) {
            output += `❌ ${result.errors.length} error(s):\n\n`;
            result.errors.forEach((error, i) => {
                output += `Error ${i + 1}:\n`;
                if (error.file && error.line) {
                    output += `  Location: ${error.file}:${error.line}:${error.column || 0}\n`;
                }
                if (error.code) {
                    output += `  Code: ${error.code}\n`;
                }
                output += `  ${error.message}\n\n`;
            });
        }

        if (result.warnings.length > 0) {
            output += `⚠️  ${result.warnings.length} warning(s):\n\n`;
            result.warnings.forEach((warning, i) => {
                output += `Warning ${i + 1}:\n`;
                if (warning.file && warning.line) {
                    output += `  Location: ${warning.file}:${warning.line}:${warning.column || 0}\n`;
                }
                output += `  ${warning.message}\n\n`;
            });
        }

        return output;
    }

    /**
     * Get errors for a specific line
     * @param {CompilationResult} result
     * @param {number} lineNumber
     * @returns {Array} Errors on that line
     */
    getErrorsForLine(result, lineNumber) {
        return [...result.errors, ...result.warnings].filter(
            error => error.line === lineNumber
        );
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RustCompilerClient;
}
