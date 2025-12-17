// Consolidated Rust Blocks for Biospheres Blockly System
// This file consolidates all Rust block definitions with enhanced metadata
// for cross-mode compatibility, template-based generation, and validation

// ============================================================================
// CUSTOM BLOCK DEFINITIONS (must be defined before JSON arrays)
// ============================================================================

/**
 * rust_call block with dynamic argument support
 * Users can right-click to add/remove arguments
 */
Blockly.Blocks['rust_call'] = {
    init: function() {
        
        // If argCount_ was set by domToMutation before init, preserve it
        const targetArgCount = this.argCount_ || 0;
        
        this.setColour(20);
        this.setOutput(true);
        this.setTooltip('Function call. Right-click to add/remove arguments.');
        
        // Create initial structure
        this.appendDummyInput('FUNC')
            .appendField('call')
            .appendField(new Blockly.FieldTextInput('function'), 'FUNCTION')
            .appendField('( )');
        this.setInputsInline(true);
        
        // If domToMutation was called before init, update shape now
        if (targetArgCount > 0) {
            this.updateShape_(targetArgCount);
        } else {
            this.argCount_ = 0;
        }
    },

    // New Blockly serialization API (v9+)
    saveExtraState: function() {
        return {
            argCount: this.argCount_ || 0
        };
    },

    loadExtraState: function(state) {
        const args = state.argCount || 0;
        this.argCount_ = args;
        
        // Only update shape if block is already initialized (has FUNC input)
        if (this.getInput('FUNC')) {
            this.updateShape_(args);
        }
    },

    // Legacy mutation API (for backwards compatibility with old XML)
    mutationToDom: function() {
        const container = Blockly.utils.xml.createElement('mutation');
        container.setAttribute('args', this.argCount_ || 0);
        return container;
    },

    domToMutation: function(xmlElement) {
        const args = parseInt(xmlElement.getAttribute('args'), 10) || 0;
        this.argCount_ = args;
        
        // Only update shape if block is already initialized (has FUNC input)
        if (this.getInput('FUNC')) {
            this.updateShape_(args);
        }
    },

    updateShape_: function(argCount) {
        // Save function name and connections before removing inputs
        let funcName = 'function';
        try {
            funcName = this.getFieldValue('FUNCTION') || 'function';
        } catch (e) {
            // Field doesn't exist yet during initial load
        }
        
        const connections = [];
        const oldArgCount = this.argCount_ || 0;
        for (let i = 0; i < oldArgCount; i++) {
            const input = this.getInput('ARG' + i);
            if (input && input.connection) {
                connections[i] = input.connection.targetConnection;
            }
        }

        // Remove old inputs
        for (let i = 0; i < oldArgCount; i++) {
            if (this.getInput('ARG' + i)) {
                this.removeInput('ARG' + i);
            }
        }
        if (this.getInput('CLOSE')) {
            this.removeInput('CLOSE');
        }
        if (this.getInput('FUNC')) {
            this.removeInput('FUNC');
        }

        // Update count
        this.argCount_ = argCount;

        // Rebuild inputs
        if (this.argCount_ === 0) {
            this.appendDummyInput('FUNC')
                .appendField('call')
                .appendField(new Blockly.FieldTextInput(funcName), 'FUNCTION')
                .appendField('( )');
        } else {
            this.appendDummyInput('FUNC')
                .appendField('call')
                .appendField(new Blockly.FieldTextInput(funcName), 'FUNCTION')
                .appendField('(');
            
            for (let i = 0; i < this.argCount_; i++) {
                const input = this.appendValueInput('ARG' + i);
                if (i > 0) {
                    input.appendField(',');
                }
                // Reconnect if possible
                if (connections[i]) {
                    setTimeout(() => {
                        if (input.connection && connections[i]) {
                            input.connection.connect(connections[i]);
                        }
                    }, 0);
                }
            }
            
            this.appendDummyInput('CLOSE')
                .appendField(')');
        }
    },

    customContextMenu: function(options) {
        // Add option to add argument
        options.push({
            text: 'Add argument',
            enabled: true,
            callback: () => {
                this.updateShape_(this.argCount_ + 1);
            }
        });

        // Add option to remove argument (if there are any)
        if (this.argCount_ > 0) {
            options.push({
                text: 'Remove argument',
                enabled: true,
                callback: () => {
                    this.updateShape_(this.argCount_ - 1);
                }
            });
        }
    }
};

// ============================================================================
// JSON BLOCK DEFINITIONS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // ============================================================================
    // FUNCTION DEFINITION BLOCKS
    // ============================================================================

    // Main Function (Entry Point)
    {
        "type": "rust_main",
        "message0": "fn main() %1 %2",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Main function - program entry point",
        "helpUrl": "",
        "mode": "rust",
        "template": "fn main() {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["BODY"]
        }
    },

    // Standard Function
    {
        "type": "rust_function",
        "message0": "fn %1 ( %2 ) %3 %4 %5",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "my_function" },
            { "type": "input_value", "name": "PARAMS_OPTIONAL", "check": "Parameters" },
            { "type": "input_dummy" },
            { "type": "input_value", "name": "RETURN_TYPE_OPTIONAL", "check": "ReturnType" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Define a standard Rust function",
        "helpUrl": "",
        "mode": "rust",
        "template": "fn {{NAME}}({{PARAMS_OPTIONAL}}) {{RETURN_TYPE_OPTIONAL}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"]
        }
    },

    // Public Function
    {
        "type": "rust_pub_function",
        "message0": "pub fn %1 ( %2 ) %3 %4 %5",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "my_function" },
            { "type": "input_value", "name": "PARAMS_OPTIONAL", "check": "Parameters" },
            { "type": "input_dummy" },
            { "type": "input_value", "name": "RETURN_TYPE_OPTIONAL", "check": "ReturnType" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Define a public Rust function",
        "helpUrl": "",
        "mode": "rust",
        "template": "pub fn {{NAME}}({{PARAMS_OPTIONAL}}) {{RETURN_TYPE_OPTIONAL}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"]
        }
    },

    // Method (with self)
    {
        "type": "rust_method",
        "message0": "fn %1 ( %2 %3 ) %4 %5 %6",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "method" },
            { "type": "field_dropdown", "name": "SELF_TYPE", "options": [
                ["&self", "REF"],
                ["&mut self", "MUT_REF"],
                ["self", "OWNED"]
            ]},
            { "type": "input_value", "name": "PARAMS_OPTIONAL", "check": "Parameters" },
            { "type": "input_dummy" },
            { "type": "input_value", "name": "RETURN_TYPE_OPTIONAL", "check": "ReturnType" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "colour": 20,
        "tooltip": "Define a method with self parameter",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"]
        }
    },

    // Function Parameters
    {
        "type": "rust_parameters",
        "message0": "%1",
        "args0": [
            { "type": "field_input", "name": "PARAMS", "text": "x: f32, y: f32" }
        ],
        "output": "Parameters",
        "colour": 20,
        "tooltip": "Function parameters",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{PARAMS}}",
        "typeInfo": {
            "inputs": {},
            "output": ["Parameters"]
        }
    },

    // Return Type
    {
        "type": "rust_return_type",
        "message0": "-> %1",
        "args0": [
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "output": "ReturnType",
        "colour": 20,
        "tooltip": "Function return type",
        "helpUrl": "",
        "mode": "rust",
        "template": "-> {{TYPE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["ReturnType"]
        }
    },

    // ============================================================================
    // IMPL BLOCKS
    // ============================================================================

    // Impl Block
    {
        "type": "rust_impl",
        "message0": "impl %1 %2 Methods: %3",
        "args0": [
            { "type": "field_input", "name": "TYPE", "text": "MyStruct" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "METHODS" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Implementation block for a type",
        "helpUrl": "",
        "mode": "rust",
        "template": "impl {{TYPE}} {\n{{METHODS}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TYPE"]
        }
    },

    // Trait Impl Block
    {
        "type": "rust_impl_trait",
        "message0": "impl %1 for %2 %3 Methods: %4",
        "args0": [
            { "type": "field_input", "name": "TRAIT", "text": "Default" },
            { "type": "field_input", "name": "TYPE", "text": "MyStruct" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "METHODS" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Implement a trait for a type",
        "helpUrl": "",
        "mode": "rust",
        "template": "impl {{TRAIT}} for {{TYPE}} {\n{{METHODS}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TRAIT", "TYPE"]
        }
    },

    // ============================================================================
    // CONTROL FLOW BLOCKS
    // ============================================================================

    // If Statement
    {
        "type": "rust_if",
        "message0": "if %1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "If statement",
        "helpUrl": "",
        "mode": "rust",
        "template": "if {{CONDITION}} {\n{{THEN}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION"]
        }
    },

    // If-Else Statement
    {
        "type": "rust_if_else",
        "message0": "if %1 %2 %3 %4 else %5",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "ELSE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "If-else statement",
        "helpUrl": "",
        "mode": "rust",
        "template": "if {{CONDITION}} {\n{{THEN}}\n} else {\n{{ELSE}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION"]
        }
    },

    // Match Expression
    {
        "type": "rust_match",
        "message0": "match %1 %2 Arms: %3",
        "args0": [
            { "type": "input_value", "name": "EXPR" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "ARMS" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Match expression",
        "helpUrl": "",
        "mode": "rust",
        "template": "match {{EXPR}} {\n{{ARMS}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["EXPR"]
        }
    },

    // Match Arm
    {
        "type": "rust_match_arm",
        "message0": "%1 => %2",
        "args0": [
            { "type": "field_input", "name": "PATTERN", "text": "Some(x)" },
            { "type": "input_value", "name": "EXPR" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Match arm",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{PATTERN}} => {{EXPR}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["PATTERN", "EXPR"]
        }
    },

    // While Loop
    {
        "type": "rust_while",
        "message0": "while %1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "While loop",
        "helpUrl": "",
        "mode": "rust",
        "template": "while {{CONDITION}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION"]
        }
    },

    // For Loop
    {
        "type": "rust_for",
        "message0": "for %1 in %2 %3 %4",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "i" },
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "For loop",
        "helpUrl": "",
        "mode": "rust",
        "template": "for {{VAR}} in {{ITERATOR}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VAR", "ITERATOR"]
        }
    },

    // Loop (infinite)
    {
        "type": "rust_loop",
        "message0": "loop %1 %2",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Infinite loop",
        "helpUrl": "",
        "mode": "rust",
        "template": "loop {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // For Loop (range)
    {
        "type": "rust_for_range",
        "message0": "for %1 in %2 .. %3 %4 %5",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "i" },
            { "type": "input_value", "name": "START" },
            { "type": "input_value", "name": "END" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "For loop over range",
        "helpUrl": "",
        "mode": "rust",
        "template": "for {{VAR}} in {{START}}..{{END}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {
                "START": ["i32", "u32", "usize", "Number"],
                "END": ["i32", "u32", "usize", "Number"]
            },
            "output": null
        },
        "validation": {
            "required": ["VAR", "START", "END"]
        }
    },

    // For Loop (iterator)
    {
        "type": "rust_for_iter",
        "message0": "for %1 in %2 %3 %4",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "item" },
            { "type": "input_value", "name": "ITER" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "For loop over iterator",
        "helpUrl": "",
        "mode": "rust",
        "template": "for {{VAR}} in {{ITER}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VAR", "ITER"]
        }
    },

    // ============================================================================
    // EXPRESSION BLOCKS
    // ============================================================================

    // Binary Operation
    {
        "type": "rust_binary_op",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "LEFT" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+", "ADD"],
                ["-", "SUB"],
                ["*", "MUL"],
                ["/", "DIV"],
                ["%", "MOD"],
                ["==", "EQ"],
                ["!=", "NE"],
                ["<", "LT"],
                [">", "GT"],
                ["<=", "LE"],
                [">=", "GE"],
                ["&&", "AND"],
                ["||", "OR"]
            ]},
            { "type": "input_value", "name": "RIGHT" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Binary operation",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {
                "LEFT": ["f32", "i32", "u32", "Number", "bool", "Boolean"],
                "RIGHT": ["f32", "i32", "u32", "Number", "bool", "Boolean"]
            },
            "output": ["f32", "i32", "u32", "Number", "bool", "Boolean"]
        },
        "validation": {
            "required": ["LEFT", "RIGHT"]
        }
    },

    // Unary Operation
    {
        "type": "rust_unary_op",
        "message0": "%1 %2",
        "args0": [
            { "type": "field_dropdown", "name": "OP", "options": [
                ["-", "NEG"],
                ["!", "NOT"],
                ["*", "DEREF"],
                ["&", "REF"],
                ["&mut", "MUT_REF"]
            ]},
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Unary operation",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["EXPR"]
        }
    },

    // Function Call - defined manually below with custom context menu

    // Method Call
    {
        "type": "rust_method_call",
        "message0": "%1 . %2 ( %3 )",
        "args0": [
            { "type": "input_value", "name": "OBJECT" },
            { "type": "field_input", "name": "METHOD", "text": "method" },
            { "type": "input_value", "name": "ARGS" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Method call",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{OBJECT}}.{{METHOD}}({{ARGS}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["OBJECT", "METHOD"]
        }
    },

    // Field Access
    {
        "type": "rust_field_access",
        "message0": "%1 . %2",
        "args0": [
            { "type": "input_value", "name": "OBJECT" },
            { "type": "field_input", "name": "FIELD", "text": "field" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Field access",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{OBJECT}}.{{FIELD}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["OBJECT", "FIELD"]
        }
    },

    // Index Access
    {
        "type": "rust_index",
        "message0": "%1 [ %2 ]",
        "args0": [
            { "type": "input_value", "name": "ARRAY" },
            { "type": "input_value", "name": "INDEX" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Array/slice indexing",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ARRAY}}[{{INDEX}}]",
        "typeInfo": {
            "inputs": {
                "INDEX": ["usize", "i32", "u32", "Number"]
            },
            "output": null
        },
        "validation": {
            "required": ["ARRAY", "INDEX"]
        }
    },

    // Tuple Access
    {
        "type": "rust_tuple_access",
        "message0": "%1 . %2",
        "args0": [
            { "type": "input_value", "name": "TUPLE" },
            { "type": "field_number", "name": "INDEX", "value": 0, "min": 0 }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Tuple field access",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{TUPLE}}.{{INDEX}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TUPLE"]
        }
    },

    // Cast
    {
        "type": "rust_cast",
        "message0": "%1 as %2",
        "args0": [
            { "type": "input_value", "name": "EXPR" },
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Type cast",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{EXPR}} as {{TYPE}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["EXPR", "TYPE"]
        }
    },

    // ============================================================================
    // LITERAL BLOCKS
    // ============================================================================

    // Number Literal
    {
        "type": "rust_number",
        "message0": "%1",
        "args0": [
            { "type": "field_number", "name": "VALUE", "value": 0 }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Number literal",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VALUE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["i32", "u32", "f32", "Number", "int", "uint", "float"]
        }
    },

    // Float Literal
    {
        "type": "rust_float",
        "message0": "%1",
        "args0": [
            { "type": "field_number", "name": "VALUE", "value": 0.0, "precision": 0.01 }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Float literal (will add .0 if needed)",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "f64", "Number", "float"]
        }
    },

    // String Literal
    {
        "type": "rust_string",
        "message0": "\"%1\"",
        "args0": [
            { "type": "field_input", "name": "VALUE", "text": "text" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "String literal",
        "helpUrl": "",
        "mode": "rust",
        "template": "\"{{VALUE}}\"",
        "typeInfo": {
            "inputs": {},
            "output": ["String", "str"]
        }
    },

    // Boolean Literal
    {
        "type": "rust_bool",
        "message0": "%1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE", "options": [
                ["true", "TRUE"],
                ["false", "FALSE"]
            ]}
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Boolean literal",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": ["bool", "Boolean"]
        }
    },

    // Variable Reference
    {
        "type": "rust_var",
        "message0": "%1",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "variable" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Variable reference",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{NAME}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // ============================================================================
    // STATEMENT BLOCKS
    // ============================================================================

    // Let Binding
    {
        "type": "rust_let",
        "message0": "let %1 %2 = %3",
        "args0": [
            { "type": "field_checkbox", "name": "MUTABLE", "checked": false },
            { "type": "field_input", "name": "NAME", "text": "value" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Let binding (check for mut)",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    // Let Binding with Type
    {
        "type": "rust_let_binding",
        "message0": "let %1 %2 %3 = %4",
        "args0": [
            { "type": "field_checkbox", "name": "MUTABLE", "checked": false },
            { "type": "field_input", "name": "NAME", "text": "value" },
            { "type": "input_value", "name": "TYPE", "check": "TypeAnnotation" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Let binding with type annotation",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    // Type Annotation
    {
        "type": "rust_type_annotation",
        "message0": ": %1",
        "args0": [
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "output": "TypeAnnotation",
        "colour": 20,
        "tooltip": "Type annotation",
        "helpUrl": "",
        "mode": "rust",
        "template": ": {{TYPE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["TypeAnnotation"]
        }
    },

    // Assignment
    {
        "type": "rust_assign",
        "message0": "%1 = %2",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "variable" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Assign value to variable",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VAR}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VAR", "VALUE"]
        }
    },

    // Assignment (with input)
    {
        "type": "rust_assignment",
        "message0": "%1 = %2",
        "args0": [
            { "type": "input_value", "name": "TARGET" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Assignment",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{TARGET}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET", "VALUE"]
        }
    },

    // Compound Assignment
    {
        "type": "rust_compound_assign",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "TARGET" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+=", "ADD"],
                ["-=", "SUB"],
                ["*=", "MUL"],
                ["/=", "DIV"],
                ["%=", "MOD"]
            ]},
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Compound assignment",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET", "VALUE"]
        }
    },

    // Return Statement
    {
        "type": "rust_return",
        "message0": "return %1",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Return statement",
        "helpUrl": "",
        "mode": "rust",
        "template": "return {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Break Statement
    {
        "type": "rust_break",
        "message0": "break",
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Break from loop",
        "helpUrl": "",
        "mode": "rust",
        "template": "break;",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Continue Statement
    {
        "type": "rust_continue",
        "message0": "continue",
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Continue to next iteration",
        "helpUrl": "",
        "mode": "rust",
        "template": "continue;",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Expression Statement
    {
        "type": "rust_expr_stmt",
        "message0": "%1 ;",
        "args0": [
            { "type": "input_value", "name": "EXPR" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Expression statement",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{EXPR}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["EXPR"]
        }
    },

    // ============================================================================
    // STRUCT & ENUM BLOCKS
    // ============================================================================

    // Struct Definition
    {
        "type": "rust_struct",
        "message0": "Struct %1 Name: %2 %3 Derives: %4 %5 Fields: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "MyStruct" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "DERIVES", "text": "Debug, Clone" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "FIELDS" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Define a Rust struct",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // Struct Field
    {
        "type": "rust_field",
        "message0": "%1 : %2",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "field_name" },
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Struct field definition",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{NAME}}: {{TYPE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    // Struct Instantiation
    {
        "type": "rust_struct_init",
        "message0": "%1 { %2 }",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "MyStruct" },
            { "type": "input_statement", "name": "FIELDS" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Struct instantiation",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // Struct Field Init
    {
        "type": "rust_field_init",
        "message0": "%1 : %2",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "field" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Struct field initialization",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{NAME}}: {{VALUE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    // Tuple Struct
    {
        "type": "rust_tuple_struct",
        "message0": "%1 ( %2 )",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "TupleStruct" },
            { "type": "input_value", "name": "VALUES" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Tuple struct instantiation",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{NAME}}({{VALUES}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // Enum Variant
    {
        "type": "rust_enum_variant",
        "message0": "%1 :: %2",
        "args0": [
            { "type": "field_input", "name": "ENUM", "text": "Option" },
            { "type": "field_input", "name": "VARIANT", "text": "Some" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Enum variant",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ENUM}}::{{VARIANT}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["ENUM", "VARIANT"]
        }
    },

    // Enum Variant with Value
    {
        "type": "rust_enum_variant_value",
        "message0": "%1 :: %2 ( %3 )",
        "args0": [
            { "type": "field_input", "name": "ENUM", "text": "Option" },
            { "type": "field_input", "name": "VARIANT", "text": "Some" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Enum variant with value",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ENUM}}::{{VARIANT}}({{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["ENUM", "VARIANT"]
        }
    },

    // ============================================================================
    // VEC3 AND MATH BLOCKS
    // ============================================================================

    // Vec3 Constructor
    {
        "type": "rust_vec3",
        "message0": "Vec3::new( %1, %2, %3 )",
        "args0": [
            { "type": "input_value", "name": "X", "check": ["Number", "f32", "float"] },
            { "type": "input_value", "name": "Y", "check": ["Number", "f32", "float"] },
            { "type": "input_value", "name": "Z", "check": ["Number", "f32", "float"] }
        ],
        "output": "Vec3",
        "colour": 20,
        "tooltip": "Create a Vec3",
        "helpUrl": "",
        "mode": "rust",
        "template": "Vec3::new({{X}}, {{Y}}, {{Z}})",
        "typeInfo": {
            "inputs": {
                "X": ["f32", "Number", "float"],
                "Y": ["f32", "Number", "float"],
                "Z": ["f32", "Number", "float"]
            },
            "output": ["Vec3", "vec3<f32>"]
        },
        "validation": {
            "required": ["X", "Y", "Z"]
        }
    },

    // ============================================================================
    // BEVY SYSTEM BLOCKS
    // ============================================================================

    // Bevy System
    {
        "type": "rust_bevy_system",
        "message0": "Bevy System %1 Name: %2 %3 Parameters: %4 %5 Body: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "my_system" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "PARAMS" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "colour": 20,
        "tooltip": "Define a Bevy system function",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // Query Parameter
    {
        "type": "rust_query_param",
        "message0": "Query %1 Name: %2 %3 Components: %4",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "cells" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "COMPONENTS", "text": "&mut Cell, &Transform" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Query parameter for system",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "COMPONENTS"]
        }
    },

    // Query with Filters
    {
        "type": "rust_query_filtered",
        "message0": "Query %1 Name: %2 %3 Components: %4 %5 Filter: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "query" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "COMPONENTS", "text": "&mut Transform, &Cell" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "FILTER", "text": "With<CpuSceneEntity>" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Query with component filter (e.g., With<T>, Without<T>)",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "COMPONENTS"]
        }
    },

    // Resource Parameter
    {
        "type": "rust_res_param",
        "message0": "Resource %1 Name: %2 Type: %3",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "time" },
            { "type": "field_input", "name": "TYPE", "text": "Res<Time>" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Resource parameter for system",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    // ResMut Parameter
    {
        "type": "rust_resmut_param",
        "message0": "ResMut %1 Name: %2 Type: %3",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "state" },
            { "type": "field_input", "name": "TYPE", "text": "MainSimState" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Mutable resource parameter",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    // Commands Parameter
    {
        "type": "rust_commands_param",
        "message0": "Commands %1 Name: %2",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "commands" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Commands for spawning/despawning entities",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    // For Each Query
    {
        "type": "rust_for_each",
        "message0": "for each %1 in %2 %3 do %4",
        "args0": [
            { "type": "field_input", "name": "PATTERN", "text": "(cell, transform)" },
            { "type": "field_input", "name": "QUERY", "text": "cells.iter_mut()" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Iterate over query results",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["PATTERN", "QUERY"]
        }
    },

    // If Let Pattern
    {
        "type": "rust_if_let",
        "message0": "if let %1 = %2 %3 then %4",
        "args0": [
            { "type": "field_input", "name": "PATTERN", "text": "Some(value)" },
            { "type": "input_value", "name": "EXPR" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Pattern matching with if let",
        "helpUrl": "",
        "mode": "rust",
        "template": "if let {{PATTERN}} = {{EXPR}} {\n{{THEN}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["PATTERN", "EXPR"]
        }
    },

    // Component Marker
    {
        "type": "rust_component",
        "message0": "Component %1 %2",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_value", "name": "STRUCT", "check": "Struct" }
        ],
        "colour": 20,
        "tooltip": "Mark struct as Bevy component",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // ============================================================================
    // OPTION & RESULT BLOCKS
    // ============================================================================

    // Option::Some
    {
        "type": "rust_option_some",
        "message0": "Some ( %1 )",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Wrap value in Some",
        "helpUrl": "",
        "mode": "rust",
        "template": "Some({{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // Option::None
    {
        "type": "rust_option_none",
        "message0": "None",
        "output": null,
        "colour": 20,
        "tooltip": "None value",
        "helpUrl": "",
        "mode": "rust",
        "template": "None",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Result::Ok
    {
        "type": "rust_result_ok",
        "message0": "Ok( %1 )",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "Result",
        "colour": 20,
        "tooltip": "Create Ok variant of Result",
        "helpUrl": "",
        "mode": "rust",
        "template": "Ok({{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": ["Result"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // Result::Err
    {
        "type": "rust_result_err",
        "message0": "Err( %1 )",
        "args0": [
            { "type": "input_value", "name": "ERROR" }
        ],
        "output": "Result",
        "colour": 0,
        "tooltip": "Create Err variant of Result",
        "helpUrl": "",
        "mode": "rust",
        "template": "Err({{ERROR}})",
        "typeInfo": {
            "inputs": {},
            "output": ["Result"]
        },
        "validation": {
            "required": ["ERROR"]
        }
    },

    // Unwrap
    {
        "type": "rust_unwrap",
        "message0": "%1 .unwrap()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 0,
        "tooltip": "Unwrap value or panic",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VALUE}}.unwrap()",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // Unwrap Or
    {
        "type": "rust_unwrap_or",
        "message0": "%1 .unwrap_or( %2 )",
        "args0": [
            { "type": "input_value", "name": "OPTION" },
            { "type": "input_value", "name": "DEFAULT" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Unwrap or use default value",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{OPTION}}.unwrap_or({{DEFAULT}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["OPTION", "DEFAULT"]
        }
    },

    // If Let Some
    {
        "type": "rust_if_let_some",
        "message0": "if let Some ( %1 ) = %2 %3 then %4",
        "args0": [
            { "type": "field_input", "name": "PATTERN", "text": "value" },
            { "type": "input_value", "name": "EXPR" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Pattern match on Option::Some",
        "helpUrl": "",
        "mode": "rust",
        "template": "if let Some({{PATTERN}}) = {{EXPR}} {\n{{THEN}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["PATTERN", "EXPR"]
        }
    },

    // If Let Ok
    {
        "type": "rust_if_let_ok",
        "message0": "if let Ok ( %1 ) = %2 %3 then %4",
        "args0": [
            { "type": "field_input", "name": "PATTERN", "text": "value" },
            { "type": "input_value", "name": "EXPR" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Pattern match on Result::Ok",
        "helpUrl": "",
        "mode": "rust",
        "template": "if let Ok({{PATTERN}}) = {{EXPR}} {\n{{THEN}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["PATTERN", "EXPR"]
        }
    },

    // ============================================================================
    // COLLECTIONS BLOCKS
    // ============================================================================

    // Vec::new
    {
        "type": "rust_vec_new",
        "message0": "Vec :: new ( )",
        "output": null,
        "colour": 20,
        "tooltip": "Create empty vector",
        "helpUrl": "",
        "mode": "rust",
        "template": "Vec::new()",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Vec Push
    {
        "type": "rust_vec_push",
        "message0": "%1 . push ( %2 )",
        "args0": [
            { "type": "field_input", "name": "VEC", "text": "vec" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Push value to vector",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VEC}}.push({{VALUE}});",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VEC", "VALUE"]
        }
    },

    // Vec Len
    {
        "type": "rust_vec_len",
        "message0": "%1 . len ( )",
        "args0": [
            { "type": "field_input", "name": "VEC", "text": "vec" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Get vector length",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VEC}}.len()",
        "typeInfo": {
            "inputs": {},
            "output": ["usize", "Number"]
        },
        "validation": {
            "required": ["VEC"]
        }
    },

    // Iter
    {
        "type": "rust_iter",
        "message0": "%1 .iter()",
        "args0": [
            { "type": "input_value", "name": "COLLECTION" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Create iterator over collection",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{COLLECTION}}.iter()",
        "typeInfo": {
            "inputs": {},
            "output": ["Iterator"]
        },
        "validation": {
            "required": ["COLLECTION"]
        }
    },

    // Map
    {
        "type": "rust_iter_map",
        "message0": "%1 .map( | %2 | %3 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "PARAM", "text": "x" },
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Transform each element",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ITERATOR}}.map(|{{PARAM}}| {{EXPR}})",
        "typeInfo": {
            "inputs": {},
            "output": ["Iterator"]
        },
        "validation": {
            "required": ["ITERATOR", "PARAM", "EXPR"]
        }
    },

    // Filter
    {
        "type": "rust_iter_filter",
        "message0": "%1 .filter( | %2 | %3 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "PARAM", "text": "x" },
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Filter elements by condition",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ITERATOR}}.filter(|{{PARAM}}| {{CONDITION}})",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": ["Iterator"]
        },
        "validation": {
            "required": ["ITERATOR", "PARAM", "CONDITION"]
        }
    },

    // Collect
    {
        "type": "rust_iter_collect",
        "message0": "%1 .collect()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Collect iterator into collection",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{ITERATOR}}.collect()",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["ITERATOR"]
        }
    },

    // ============================================================================
    // STRING BLOCKS
    // ============================================================================

    // String::new
    {
        "type": "rust_string_new",
        "message0": "String::new()",
        "output": "String",
        "colour": 20,
        "tooltip": "Create empty String",
        "helpUrl": "",
        "mode": "rust",
        "template": "String::new()",
        "typeInfo": {
            "inputs": {},
            "output": ["String", "str"]
        }
    },

    // String::from
    {
        "type": "rust_string_from",
        "message0": "String::from( %1 )",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "String" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Create String from &str",
        "helpUrl": "",
        "mode": "rust",
        "template": "String::from({{VALUE}})",
        "typeInfo": {
            "inputs": {
                "VALUE": ["String", "str"]
            },
            "output": ["String", "str"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // String Concatenation
    {
        "type": "rust_string_concat",
        "message0": "%1 + %2",
        "args0": [
            { "type": "input_value", "name": "LEFT", "check": "String" },
            { "type": "input_value", "name": "RIGHT", "check": "String" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Concatenate strings",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{LEFT}} + {{RIGHT}}",
        "typeInfo": {
            "inputs": {
                "LEFT": ["String", "str"],
                "RIGHT": ["String", "str"]
            },
            "output": ["String", "str"]
        },
        "validation": {
            "required": ["LEFT", "RIGHT"]
        }
    },

    // ============================================================================
    // MACRO BLOCKS
    // ============================================================================

    // println! Macro
    {
        "type": "rust_println",
        "message0": "println! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "MESSAGE" }
        ],
        "previousStatement": "Statement",
        "nextStatement": "Statement",
        "colour": 20,
        "tooltip": "Print line macro",
        "helpUrl": "",
        "mode": "rust",
        "template": "println!({{MESSAGE}});",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // format! Macro
    {
        "type": "rust_format",
        "message0": "format! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "FORMAT" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Format string macro",
        "helpUrl": "",
        "mode": "rust",
        "template": "format!({{FORMAT}})",
        "typeInfo": {
            "inputs": {},
            "output": ["String", "str"]
        }
    },

    // vec! Macro
    {
        "type": "rust_vec_macro",
        "message0": "vec! [ %1 ]",
        "args0": [
            { "type": "input_value", "name": "ELEMENTS" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Vec macro",
        "helpUrl": "",
        "mode": "rust",
        "template": "vec![{{ELEMENTS}}]",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // panic! Macro
    {
        "type": "rust_panic",
        "message0": "panic! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "MESSAGE" }
        ],
        "previousStatement": null,
        "colour": 0,
        "tooltip": "Panic macro",
        "helpUrl": "",
        "mode": "rust",
        "template": "panic!({{MESSAGE}});",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // ============================================================================
    // COMMENT BLOCKS
    // ============================================================================

    // Line Comment
    {
        "type": "rust_comment",
        "message0": "// %1",
        "args0": [
            { "type": "field_input", "name": "TEXT", "text": "comment" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 65,
        "tooltip": "Line comment",
        "helpUrl": "",
        "mode": "rust",
        "template": "// {{TEXT}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // Doc Comment
    {
        "type": "rust_doc_comment",
        "message0": "/// %1",
        "args0": [
            { "type": "field_input", "name": "TEXT", "text": "documentation" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 65,
        "tooltip": "Documentation comment",
        "helpUrl": "",
        "mode": "rust",
        "template": "/// {{TEXT}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        }
    },

    // ============================================================================
    // MATH BLOCKS
    // ============================================================================

    // Absolute Value
    {
        "type": "rust_abs",
        "message0": "%1 .abs()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Absolute value",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VALUE}}.abs()",
        "typeInfo": {
            "inputs": {
                "VALUE": ["f32", "i32", "Number", "float", "int"]
            },
            "output": ["f32", "i32", "Number", "float", "int"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // Square Root
    {
        "type": "rust_sqrt",
        "message0": "%1 .sqrt()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Square root",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VALUE}}.sqrt()",
        "typeInfo": {
            "inputs": {
                "VALUE": ["f32", "f64", "Number", "float"]
            },
            "output": ["f32", "f64", "Number", "float"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // Min
    {
        "type": "rust_min",
        "message0": "%1 .min( %2 )",
        "args0": [
            { "type": "input_value", "name": "A", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Minimum of two values",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{A}}.min({{B}})",
        "typeInfo": {
            "inputs": {
                "A": ["f32", "i32", "Number", "float", "int"],
                "B": ["f32", "i32", "Number", "float", "int"]
            },
            "output": ["f32", "i32", "Number", "float", "int"]
        },
        "validation": {
            "required": ["A", "B"]
        }
    },

    // Max
    {
        "type": "rust_max",
        "message0": "%1 .max( %2 )",
        "args0": [
            { "type": "input_value", "name": "A", "check": "Number" },
            { "type": "input_value", "name": "B", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Maximum of two values",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{A}}.max({{B}})",
        "typeInfo": {
            "inputs": {
                "A": ["f32", "i32", "Number", "float", "int"],
                "B": ["f32", "i32", "Number", "float", "int"]
            },
            "output": ["f32", "i32", "Number", "float", "int"]
        },
        "validation": {
            "required": ["A", "B"]
        }
    },

    // Clamp
    {
        "type": "rust_clamp",
        "message0": "%1 .clamp( %2 , %3 )",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" },
            { "type": "input_value", "name": "MIN", "check": "Number" },
            { "type": "input_value", "name": "MAX", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Clamp value between min and max",
        "helpUrl": "",
        "mode": "rust",
        "template": "{{VALUE}}.clamp({{MIN}}, {{MAX}})",
        "typeInfo": {
            "inputs": {
                "VALUE": ["f32", "i32", "Number", "float", "int"],
                "MIN": ["f32", "i32", "Number", "float", "int"],
                "MAX": ["f32", "i32", "Number", "float", "int"]
            },
            "output": ["f32", "i32", "Number", "float", "int"]
        },
        "validation": {
            "required": ["VALUE", "MIN", "MAX"],
            "constraints": {
                "MIN": { "max": "MAX" }
            }
        }
    },

    // ============================================================================
    // CROSS-MODE REFERENCE BLOCKS
    // ============================================================================

    // Reference Node - Links to code in another file or mode
    {
        "type": "rust_reference_node",
        "message0": "Reference 🔗 %1 Target File: %2 %3 Symbol: %4 %5 Description: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "TARGET_FILE", "text": "shader.wgsl" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "TARGET_SYMBOL", "text": "" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "DESCRIPTION", "text": "" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Create a reference to code in another file or mode. Used for cross-mode imports and dependencies.",
        "helpUrl": "",
        "mode": "rust",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET_FILE"]
        }
    }
]);

// ============================================================================
// ADDITIONAL MACRO BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // print! Macro
    {
        "type": "rust_print",
        "message0": "print! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "MESSAGE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Print macro (without newline)",
        "helpUrl": "",
        "mode": "rust"
    },

    // assert! Macro
    {
        "type": "rust_assert",
        "message0": "assert! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 0,
        "tooltip": "Assert condition is true",
        "helpUrl": "",
        "mode": "rust"
    },

    // assert_eq! Macro
    {
        "type": "rust_assert_eq",
        "message0": "assert_eq! ( %1 , %2 )",
        "args0": [
            { "type": "input_value", "name": "LEFT" },
            { "type": "input_value", "name": "RIGHT" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 0,
        "tooltip": "Assert two values are equal",
        "helpUrl": "",
        "mode": "rust"
    },

    // dbg! Macro
    {
        "type": "rust_dbg",
        "message0": "dbg! ( %1 )",
        "args0": [
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Debug print and return value",
        "helpUrl": "",
        "mode": "rust"
    },

    // format! with args
    {
        "type": "rust_format_macro",
        "message0": "format! ( %1 , %2 )",
        "args0": [
            { "type": "input_value", "name": "FORMAT" },
            { "type": "input_value", "name": "ARGS" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Format string with arguments",
        "helpUrl": "",
        "mode": "rust"
    },

    // format! single arg
    {
        "type": "rust_format_single",
        "message0": "format! ( %1 , %2 )",
        "args0": [
            { "type": "field_input", "name": "FORMAT", "text": "{}" },
            { "type": "input_value", "name": "ARG" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Format string with single argument",
        "helpUrl": "",
        "mode": "rust"
    },

    // ============================================================================
    // EXTENDED STRING BLOCKS
    // ============================================================================

    // to_string method
    {
        "type": "rust_to_string",
        "message0": "%1 .to_string()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Convert value to String",
        "helpUrl": "",
        "mode": "rust"
    },

    // String literal (alternative)
    {
        "type": "rust_string_literal",
        "message0": "\"%1\"",
        "args0": [
            { "type": "field_input", "name": "TEXT", "text": "" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "String literal",
        "helpUrl": "",
        "mode": "rust"
    },

    // push_str
    {
        "type": "rust_string_push_str",
        "message0": "%1 .push_str( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "TEXT", "check": "String" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Append string slice to String",
        "helpUrl": "",
        "mode": "rust"
    },

    // push (char)
    {
        "type": "rust_string_push",
        "message0": "%1 .push( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "CHAR" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Append character to String",
        "helpUrl": "",
        "mode": "rust"
    },

    // len
    {
        "type": "rust_string_len",
        "message0": "%1 .len()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Get string length in bytes",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_empty
    {
        "type": "rust_string_is_empty",
        "message0": "%1 .is_empty()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if string is empty",
        "helpUrl": "",
        "mode": "rust"
    },

    // contains
    {
        "type": "rust_string_contains",
        "message0": "%1 .contains( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "PATTERN" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if string contains pattern",
        "helpUrl": "",
        "mode": "rust"
    },

    // starts_with
    {
        "type": "rust_string_starts_with",
        "message0": "%1 .starts_with( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "PATTERN" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if string starts with pattern",
        "helpUrl": "",
        "mode": "rust"
    },

    // ends_with
    {
        "type": "rust_string_ends_with",
        "message0": "%1 .ends_with( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "PATTERN" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if string ends with pattern",
        "helpUrl": "",
        "mode": "rust"
    },

    // trim
    {
        "type": "rust_string_trim",
        "message0": "%1 .trim()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Remove leading and trailing whitespace",
        "helpUrl": "",
        "mode": "rust"
    },

    // trim_start
    {
        "type": "rust_string_trim_start",
        "message0": "%1 .trim_start()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Remove leading whitespace",
        "helpUrl": "",
        "mode": "rust"
    },

    // trim_end
    {
        "type": "rust_string_trim_end",
        "message0": "%1 .trim_end()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Remove trailing whitespace",
        "helpUrl": "",
        "mode": "rust"
    },

    // to_lowercase
    {
        "type": "rust_string_to_lowercase",
        "message0": "%1 .to_lowercase()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Convert string to lowercase",
        "helpUrl": "",
        "mode": "rust"
    },

    // to_uppercase
    {
        "type": "rust_string_to_uppercase",
        "message0": "%1 .to_uppercase()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Convert string to uppercase",
        "helpUrl": "",
        "mode": "rust"
    },

    // replace
    {
        "type": "rust_string_replace",
        "message0": "%1 .replace( %2 , %3 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "FROM" },
            { "type": "input_value", "name": "TO" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Replace all occurrences",
        "helpUrl": "",
        "mode": "rust"
    },

    // replacen
    {
        "type": "rust_string_replacen",
        "message0": "%1 .replacen( %2 , %3 , %4 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "FROM" },
            { "type": "input_value", "name": "TO" },
            { "type": "input_value", "name": "COUNT" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Replace first N occurrences",
        "helpUrl": "",
        "mode": "rust"
    },

    // split
    {
        "type": "rust_string_split",
        "message0": "%1 .split( %2 )",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "PATTERN" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Split string by pattern",
        "helpUrl": "",
        "mode": "rust"
    },

    // split_whitespace
    {
        "type": "rust_string_split_whitespace",
        "message0": "%1 .split_whitespace()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Split string by whitespace",
        "helpUrl": "",
        "mode": "rust"
    },

    // lines
    {
        "type": "rust_string_lines",
        "message0": "%1 .lines()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Iterate over lines",
        "helpUrl": "",
        "mode": "rust"
    },

    // chars
    {
        "type": "rust_string_chars",
        "message0": "%1 .chars()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Iterate over characters",
        "helpUrl": "",
        "mode": "rust"
    },

    // bytes
    {
        "type": "rust_string_bytes",
        "message0": "%1 .bytes()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Iterate over bytes",
        "helpUrl": "",
        "mode": "rust"
    },

    // parse
    {
        "type": "rust_string_parse",
        "message0": "%1 .parse()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Parse string to type",
        "helpUrl": "",
        "mode": "rust"
    },

    // parse with type
    {
        "type": "rust_string_parse_typed",
        "message0": "%1 .parse::< %2 >()",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "field_input", "name": "TYPE", "text": "i32" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Parse string to specific type",
        "helpUrl": "",
        "mode": "rust"
    },

    // slice
    {
        "type": "rust_string_slice",
        "message0": "&%1 [ %2 .. %3 ]",
        "args0": [
            { "type": "input_value", "name": "STRING" },
            { "type": "input_value", "name": "START" },
            { "type": "input_value", "name": "END" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Get string slice",
        "helpUrl": "",
        "mode": "rust"
    },

    // as_str
    {
        "type": "rust_string_as_str",
        "message0": "%1 .as_str()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "output": "String",
        "colour": 20,
        "tooltip": "Convert String to &str",
        "helpUrl": "",
        "mode": "rust"
    },

    // clear
    {
        "type": "rust_string_clear",
        "message0": "%1 .clear()",
        "args0": [
            { "type": "input_value", "name": "STRING" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Clear string contents",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// EXTENDED MATH BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // pow
    {
        "type": "rust_pow",
        "message0": "%1 .powf( %2 )",
        "args0": [
            { "type": "input_value", "name": "BASE", "check": "Number" },
            { "type": "input_value", "name": "EXPONENT", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Raise to power",
        "helpUrl": "",
        "mode": "rust"
    },

    // cbrt
    {
        "type": "rust_cbrt",
        "message0": "%1 .cbrt()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Cube root",
        "helpUrl": "",
        "mode": "rust"
    },

    // floor
    {
        "type": "rust_floor",
        "message0": "%1 .floor()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Round down to integer",
        "helpUrl": "",
        "mode": "rust"
    },

    // ceil
    {
        "type": "rust_ceil",
        "message0": "%1 .ceil()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Round up to integer",
        "helpUrl": "",
        "mode": "rust"
    },

    // round
    {
        "type": "rust_round",
        "message0": "%1 .round()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Round to nearest integer",
        "helpUrl": "",
        "mode": "rust"
    },

    // trunc
    {
        "type": "rust_trunc",
        "message0": "%1 .trunc()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Truncate decimal part",
        "helpUrl": "",
        "mode": "rust"
    },

    // fract
    {
        "type": "rust_fract",
        "message0": "%1 .fract()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Get fractional part",
        "helpUrl": "",
        "mode": "rust"
    },

    // sin
    {
        "type": "rust_sin",
        "message0": "%1 .sin()",
        "args0": [
            { "type": "input_value", "name": "ANGLE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Sine (radians)",
        "helpUrl": "",
        "mode": "rust"
    },

    // cos
    {
        "type": "rust_cos",
        "message0": "%1 .cos()",
        "args0": [
            { "type": "input_value", "name": "ANGLE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Cosine (radians)",
        "helpUrl": "",
        "mode": "rust"
    },

    // tan
    {
        "type": "rust_tan",
        "message0": "%1 .tan()",
        "args0": [
            { "type": "input_value", "name": "ANGLE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Tangent (radians)",
        "helpUrl": "",
        "mode": "rust"
    },

    // asin
    {
        "type": "rust_asin",
        "message0": "%1 .asin()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Arc sine",
        "helpUrl": "",
        "mode": "rust"
    },

    // acos
    {
        "type": "rust_acos",
        "message0": "%1 .acos()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Arc cosine",
        "helpUrl": "",
        "mode": "rust"
    },

    // atan
    {
        "type": "rust_atan",
        "message0": "%1 .atan()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Arc tangent",
        "helpUrl": "",
        "mode": "rust"
    },

    // atan2
    {
        "type": "rust_atan2",
        "message0": "%1 .atan2( %2 )",
        "args0": [
            { "type": "input_value", "name": "Y", "check": "Number" },
            { "type": "input_value", "name": "X", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Arc tangent of y/x",
        "helpUrl": "",
        "mode": "rust"
    },

    // to_radians
    {
        "type": "rust_to_radians",
        "message0": "%1 .to_radians()",
        "args0": [
            { "type": "input_value", "name": "DEGREES", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Convert degrees to radians",
        "helpUrl": "",
        "mode": "rust"
    },

    // to_degrees
    {
        "type": "rust_to_degrees",
        "message0": "%1 .to_degrees()",
        "args0": [
            { "type": "input_value", "name": "RADIANS", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Convert radians to degrees",
        "helpUrl": "",
        "mode": "rust"
    },

    // exp
    {
        "type": "rust_exp",
        "message0": "%1 .exp()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "e raised to power",
        "helpUrl": "",
        "mode": "rust"
    },

    // exp2
    {
        "type": "rust_exp2",
        "message0": "%1 .exp2()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "2 raised to power",
        "helpUrl": "",
        "mode": "rust"
    },

    // ln
    {
        "type": "rust_ln",
        "message0": "%1 .ln()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Natural logarithm",
        "helpUrl": "",
        "mode": "rust"
    },

    // log2
    {
        "type": "rust_log2",
        "message0": "%1 .log2()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Base-2 logarithm",
        "helpUrl": "",
        "mode": "rust"
    },

    // log10
    {
        "type": "rust_log10",
        "message0": "%1 .log10()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Base-10 logarithm",
        "helpUrl": "",
        "mode": "rust"
    },

    // log
    {
        "type": "rust_log",
        "message0": "%1 .log( %2 )",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" },
            { "type": "input_value", "name": "BASE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Logarithm with custom base",
        "helpUrl": "",
        "mode": "rust"
    },

    // PI constant
    {
        "type": "rust_pi",
        "message0": "π (PI)",
        "output": "Number",
        "colour": 20,
        "tooltip": "Pi constant (3.14159...)",
        "helpUrl": "",
        "mode": "rust"
    },

    // E constant
    {
        "type": "rust_e",
        "message0": "e (E)",
        "output": "Number",
        "colour": 20,
        "tooltip": "Euler's number (2.71828...)",
        "helpUrl": "",
        "mode": "rust"
    },

    // TAU constant
    {
        "type": "rust_tau",
        "message0": "τ (TAU)",
        "output": "Number",
        "colour": 20,
        "tooltip": "Tau constant (2π)",
        "helpUrl": "",
        "mode": "rust"
    },

    // signum
    {
        "type": "rust_signum",
        "message0": "%1 .signum()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Sign of number (-1, 0, or 1)",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_sign_positive
    {
        "type": "rust_is_sign_positive",
        "message0": "%1 .is_sign_positive()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if positive",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_sign_negative
    {
        "type": "rust_is_sign_negative",
        "message0": "%1 .is_sign_negative()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if negative",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_finite
    {
        "type": "rust_is_finite",
        "message0": "%1 .is_finite()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if finite",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_infinite
    {
        "type": "rust_is_infinite",
        "message0": "%1 .is_infinite()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if infinite",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_nan
    {
        "type": "rust_is_nan",
        "message0": "%1 .is_nan()",
        "args0": [
            { "type": "input_value", "name": "VALUE", "check": "Number" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if NaN",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// ARRAY AND COLLECTION BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Array literal
    {
        "type": "rust_array_literal",
        "message0": "[ %1 ]",
        "args0": [
            { "type": "input_value", "name": "ELEMENTS" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Array literal",
        "helpUrl": "",
        "mode": "rust"
    },

    // Array with repeated value
    {
        "type": "rust_array_typed",
        "message0": "[ %1 ; %2 ]",
        "args0": [
            { "type": "input_value", "name": "VALUE" },
            { "type": "input_value", "name": "SIZE" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Array with repeated value",
        "helpUrl": "",
        "mode": "rust"
    },

    // Slice
    {
        "type": "rust_slice",
        "message0": "&%1 [ %2 .. %3 ]",
        "args0": [
            { "type": "input_value", "name": "ARRAY" },
            { "type": "input_value", "name": "START" },
            { "type": "input_value", "name": "END" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Slice of array",
        "helpUrl": "",
        "mode": "rust"
    },

    // Range
    {
        "type": "rust_range",
        "message0": "%1 .. %2",
        "args0": [
            { "type": "input_value", "name": "START" },
            { "type": "input_value", "name": "END" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Range (exclusive end)",
        "helpUrl": "",
        "mode": "rust"
    },

    // Range inclusive
    {
        "type": "rust_range_inclusive",
        "message0": "%1 ..= %2",
        "args0": [
            { "type": "input_value", "name": "START" },
            { "type": "input_value", "name": "END" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Range (inclusive end)",
        "helpUrl": "",
        "mode": "rust"
    },

    // Array len
    {
        "type": "rust_array_len",
        "message0": "%1 .len()",
        "args0": [
            { "type": "input_value", "name": "ARRAY" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Get array length",
        "helpUrl": "",
        "mode": "rust"
    },

    // Array is_empty
    {
        "type": "rust_array_is_empty",
        "message0": "%1 .is_empty()",
        "args0": [
            { "type": "input_value", "name": "ARRAY" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if array is empty",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// ITERATOR BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // iter_mut
    {
        "type": "rust_iter_mut",
        "message0": "%1 .iter_mut()",
        "args0": [
            { "type": "input_value", "name": "COLLECTION" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Create mutable iterator",
        "helpUrl": "",
        "mode": "rust"
    },

    // into_iter
    {
        "type": "rust_into_iter",
        "message0": "%1 .into_iter()",
        "args0": [
            { "type": "input_value", "name": "COLLECTION" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Create consuming iterator",
        "helpUrl": "",
        "mode": "rust"
    },

    // collect with type
    {
        "type": "rust_iter_collect_typed",
        "message0": "%1 .collect::< %2 >()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "TYPE", "text": "Vec<_>" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Collect into specific type",
        "helpUrl": "",
        "mode": "rust"
    },

    // fold
    {
        "type": "rust_iter_fold",
        "message0": "%1 .fold( %2 , | %3 , %4 | %5 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "input_value", "name": "INIT" },
            { "type": "field_input", "name": "ACC", "text": "acc" },
            { "type": "field_input", "name": "ITEM", "text": "item" },
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Fold iterator with accumulator",
        "helpUrl": "",
        "mode": "rust"
    },

    // sum
    {
        "type": "rust_iter_sum",
        "message0": "%1 .sum()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Sum all elements",
        "helpUrl": "",
        "mode": "rust"
    },

    // count
    {
        "type": "rust_iter_count",
        "message0": "%1 .count()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": "Number",
        "colour": 20,
        "tooltip": "Count elements",
        "helpUrl": "",
        "mode": "rust"
    },

    // any
    {
        "type": "rust_iter_any",
        "message0": "%1 .any( | %2 | %3 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "PARAM", "text": "x" },
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if any element matches",
        "helpUrl": "",
        "mode": "rust"
    },

    // all
    {
        "type": "rust_iter_all",
        "message0": "%1 .all( | %2 | %3 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "PARAM", "text": "x" },
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if all elements match",
        "helpUrl": "",
        "mode": "rust"
    },

    // find
    {
        "type": "rust_iter_find",
        "message0": "%1 .find( | %2 | %3 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "field_input", "name": "PARAM", "text": "x" },
            { "type": "input_value", "name": "CONDITION", "check": "Boolean" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Find first matching element",
        "helpUrl": "",
        "mode": "rust"
    },

    // take
    {
        "type": "rust_iter_take",
        "message0": "%1 .take( %2 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "input_value", "name": "N" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Take first N elements",
        "helpUrl": "",
        "mode": "rust"
    },

    // skip
    {
        "type": "rust_iter_skip",
        "message0": "%1 .skip( %2 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" },
            { "type": "input_value", "name": "N" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Skip first N elements",
        "helpUrl": "",
        "mode": "rust"
    },

    // enumerate
    {
        "type": "rust_iter_enumerate",
        "message0": "%1 .enumerate()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Add index to each element",
        "helpUrl": "",
        "mode": "rust"
    },

    // zip
    {
        "type": "rust_iter_zip",
        "message0": "%1 .zip( %2 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR1" },
            { "type": "input_value", "name": "ITERATOR2" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Zip two iterators together",
        "helpUrl": "",
        "mode": "rust"
    },

    // chain
    {
        "type": "rust_iter_chain",
        "message0": "%1 .chain( %2 )",
        "args0": [
            { "type": "input_value", "name": "ITERATOR1" },
            { "type": "input_value", "name": "ITERATOR2" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Chain two iterators",
        "helpUrl": "",
        "mode": "rust"
    },

    // max
    {
        "type": "rust_iter_max",
        "message0": "%1 .max()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Find maximum element",
        "helpUrl": "",
        "mode": "rust"
    },

    // min
    {
        "type": "rust_iter_min",
        "message0": "%1 .min()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Find minimum element",
        "helpUrl": "",
        "mode": "rust"
    },

    // reverse
    {
        "type": "rust_iter_reverse",
        "message0": "%1 .rev()",
        "args0": [
            { "type": "input_value", "name": "ITERATOR" }
        ],
        "output": "Iterator",
        "colour": 20,
        "tooltip": "Reverse iterator",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// ERROR HANDLING BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // expect
    {
        "type": "rust_expect",
        "message0": "%1 .expect( %2 )",
        "args0": [
            { "type": "input_value", "name": "VALUE" },
            { "type": "input_value", "name": "MESSAGE" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Unwrap with custom error message",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_ok
    {
        "type": "rust_is_ok",
        "message0": "%1 .is_ok()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if Result is Ok",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_err
    {
        "type": "rust_is_err",
        "message0": "%1 .is_err()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if Result is Err",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_some
    {
        "type": "rust_is_some",
        "message0": "%1 .is_some()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if Option is Some",
        "helpUrl": "",
        "mode": "rust"
    },

    // is_none
    {
        "type": "rust_is_none",
        "message0": "%1 .is_none()",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": "Boolean",
        "colour": 20,
        "tooltip": "Check if Option is None",
        "helpUrl": "",
        "mode": "rust"
    },

    // ? operator
    {
        "type": "rust_question_mark",
        "message0": "%1 ?",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Question mark operator for error propagation",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// ASYNC/AWAIT BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Async function
    {
        "type": "rust_async_function",
        "message0": "async fn %1 ( %2 ) %3 %4 %5",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "async_function" },
            { "type": "input_value", "name": "PARAMS_OPTIONAL", "check": "Parameters" },
            { "type": "input_dummy" },
            { "type": "input_value", "name": "RETURN_TYPE_OPTIONAL", "check": "ReturnType" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "colour": 20,
        "tooltip": "Define an async function",
        "helpUrl": "",
        "mode": "rust"
    },

    // await
    {
        "type": "rust_await",
        "message0": "%1 .await",
        "args0": [
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Await a future",
        "helpUrl": "",
        "mode": "rust"
    },

    // async block
    {
        "type": "rust_async_block",
        "message0": "async %1 %2",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Async block",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// LIFETIME BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Lifetime parameter
    {
        "type": "rust_lifetime_param",
        "message0": "' %1",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "a" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Lifetime parameter",
        "helpUrl": "",
        "mode": "rust"
    },

    // Lifetime annotation
    {
        "type": "rust_lifetime_annotation",
        "message0": "&' %1 %2",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "a" },
            { "type": "field_input", "name": "TYPE", "text": "str" }
        ],
        "output": null,
        "colour": 20,
        "tooltip": "Reference with lifetime",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// TRAIT BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Trait definition
    {
        "type": "rust_trait_def",
        "message0": "trait %1 %2 Methods: %3",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "MyTrait" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "METHODS" }
        ],
        "colour": 20,
        "tooltip": "Define a trait",
        "helpUrl": "",
        "mode": "rust"
    },

    // Trait method signature
    {
        "type": "rust_trait_method",
        "message0": "fn %1 ( %2 ) %3",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "method" },
            { "type": "input_value", "name": "PARAMS_OPTIONAL", "check": "Parameters" },
            { "type": "input_value", "name": "RETURN_TYPE_OPTIONAL", "check": "ReturnType" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Trait method signature",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// FILE ORGANIZATION BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // File container - organizes blocks into a specific file
    {
        "type": "file_container",
        "message0": "📄 File: %1 %2 %3",
        "args0": [
            { "type": "field_input", "name": "FILENAME", "text": "main.rs" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "CONTENTS", "check": "TopLevel" }
        ],
        "colour": 20,
        "tooltip": "Organize blocks into a specific file. All blocks inside will generate into this file.",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// MODULE BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Module definition
    {
        "type": "rust_mod",
        "message0": "mod %1 %2 %3",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "my_module" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "colour": 20,
        "tooltip": "Define a module",
        "helpUrl": "",
        "mode": "rust"
    },

    // Module file link - links to another file
    {
        "type": "rust_mod_file",
        "message0": "🔗 mod %1;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "my_module" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Link to another file (e.g., 'mod utils;' links to utils.rs)",
        "helpUrl": "",
        "mode": "rust"
    },

    // use statement
    {
        "type": "rust_use",
        "message0": "use %1",
        "args0": [
            { "type": "field_input", "name": "PATH", "text": "std::collections::HashMap" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Import items into scope",
        "helpUrl": "",
        "mode": "rust"
    },

    // pub use statement
    {
        "type": "rust_pub_use",
        "message0": "pub use %1",
        "args0": [
            { "type": "field_input", "name": "PATH", "text": "std::collections::HashMap" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 20,
        "tooltip": "Re-export items",
        "helpUrl": "",
        "mode": "rust"
    },

    // extern crate
    {
        "type": "rust_extern_crate",
        "message0": "extern crate %1",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "serde" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 20,
        "tooltip": "Import external crate",
        "helpUrl": "",
        "mode": "rust"
    }
]);

// ============================================================================
// ADDITIONAL COMMENT BLOCKS
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // Block comment
    {
        "type": "rust_block_comment",
        "message0": "/* %1 */",
        "args0": [
            { "type": "field_input", "name": "TEXT", "text": "comment" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 65,
        "tooltip": "Block comment",
        "helpUrl": "",
        "mode": "rust"
    }
]);
