// Consolidated WGSL Shader Blocks for Biospheres
// Merged from: wgsl_blocks.js, comprehensive_wgsl_blocks.js, comprehensive_math_blocks.js
// All blocks enhanced with mode, template, typeInfo, and validation fields

Blockly.defineBlocksWithJsonArray([
    // ============================================================================
    // FILE ORGANIZATION
    // ============================================================================

    {
        "type": "wgsl_file_container",
        "message0": "🎨 WGSL Shader: %1 %2 %3",
        "args0": [
            { "type": "field_input", "name": "FILENAME", "text": "shader.wgsl" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "CONTENTS", "check": "TopLevel" }
        ],
        "colour": 270,
        "tooltip": "WGSL shader file container. All shader code goes inside this block.",
        "helpUrl": "",
        "mode": "wgsl",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["FILENAME"],
            "constraints": {
                "FILENAME": { "pattern": /^[a-zA-Z0-9_-]+\.wgsl$/ }
            }
        }
    },

    // ============================================================================
    // SHADER ENTRY POINTS
    // ============================================================================

    {
        "type": "wgsl_compute_shader",
        "message0": "Compute Shader %1 Workgroup Size: %2 %3 Bindings: %4 %5 Main Function: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_number", "name": "WORKGROUP_SIZE", "value": 64, "min": 1 },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BINDINGS" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "MAIN" }
        ],
        "colour": 270,
        "tooltip": "Define a WGSL compute shader",
        "helpUrl": "",
        "mode": "wgsl",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["WORKGROUP_SIZE", "MAIN"],
            "constraints": {
                "WORKGROUP_SIZE": { "min": 1, "max": 1024 }
            }
        }
    },

    {
        "type": "wgsl_compute_shader_full",
        "message0": "@compute @workgroup_size( %1 , %2 , %3 ) %4 fn %5 ( %6 ) %7 %8",
        "args0": [
            { "type": "field_number", "name": "X", "value": 64, "min": 1 },
            { "type": "field_number", "name": "Y", "value": 1, "min": 1 },
            { "type": "field_number", "name": "Z", "value": 1, "min": 1 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "main" },
            { "type": "input_value", "name": "PARAMS", "check": "ComputeParams" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Compute shader entry point with workgroup size",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@compute @workgroup_size({{X}}, {{Y}}, {{Z}})\nfn {{NAME}}({{PARAMS}}) {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"],
            "constraints": {
                "X": { "min": 1, "max": 1024 },
                "Y": { "min": 1, "max": 1024 },
                "Z": { "min": 1, "max": 1024 }
            }
        }
    },

    {
        "type": "wgsl_vertex_shader",
        "message0": "@vertex %1 fn %2 ( %3 ) -> %4 %5 %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "vs_main" },
            { "type": "input_value", "name": "INPUT", "check": "VertexInput" },
            { "type": "input_value", "name": "OUTPUT", "check": "VertexOutput" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Vertex shader entry point",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@vertex\nfn {{NAME}}({{INPUT}}) -> {{OUTPUT}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"]
        }
    },

    {
        "type": "wgsl_fragment_shader",
        "message0": "@fragment %1 fn %2 ( %3 ) -> %4 %5 %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "fs_main" },
            { "type": "input_value", "name": "INPUT", "check": "FragmentInput" },
            { "type": "input_value", "name": "OUTPUT", "check": "FragmentOutput" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Fragment shader entry point",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@fragment\nfn {{NAME}}({{INPUT}}) -> {{OUTPUT}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "BODY"]
        }
    },

    // ============================================================================
    // STRUCT DEFINITIONS
    // ============================================================================

    {
        "type": "wgsl_struct",
        "message0": "struct %1 { %2 %3 }",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "MyStruct" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "FIELDS" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Define a struct",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "struct {{NAME}} {\n{{FIELDS}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    {
        "type": "wgsl_struct_field",
        "message0": "%1 : %2 ,",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "field" },
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Struct field",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{NAME}}: {{TYPE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    {
        "type": "wgsl_struct_field_location",
        "message0": "@location( %1 ) %2 : %3 ,",
        "args0": [
            { "type": "field_number", "name": "LOCATION", "value": 0, "min": 0 },
            { "type": "field_input", "name": "NAME", "text": "position" },
            { "type": "field_input", "name": "TYPE", "text": "vec3<f32>" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Struct field with location attribute",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@location({{LOCATION}}) {{NAME}}: {{TYPE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["LOCATION", "NAME", "TYPE"],
            "constraints": {
                "LOCATION": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_struct_field_builtin",
        "message0": "@builtin( %1 ) %2 : %3 ,",
        "args0": [
            { "type": "field_dropdown", "name": "BUILTIN", "options": [
                ["position", "position"],
                ["vertex_index", "vertex_index"],
                ["instance_index", "instance_index"],
                ["front_facing", "front_facing"],
                ["frag_depth", "frag_depth"],
                ["sample_index", "sample_index"],
                ["sample_mask", "sample_mask"],
                ["global_invocation_id", "global_invocation_id"],
                ["local_invocation_id", "local_invocation_id"],
                ["local_invocation_index", "local_invocation_index"],
                ["workgroup_id", "workgroup_id"],
                ["num_workgroups", "num_workgroups"]
            ]},
            { "type": "field_input", "name": "NAME", "text": "position" },
            { "type": "field_input", "name": "TYPE", "text": "vec4<f32>" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Struct field with builtin attribute",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@builtin({{BUILTIN}}) {{NAME}}: {{TYPE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["BUILTIN", "NAME", "TYPE"]
        }
    },

    {
        "type": "wgsl_struct_field_align",
        "message0": "@align( %1 ) %2 : %3 ,",
        "args0": [
            { "type": "field_dropdown", "name": "ALIGN", "options": [
                ["4", "4"],
                ["8", "8"],
                ["16", "16"],
                ["32", "32"],
                ["64", "64"],
                ["128", "128"],
                ["256", "256"]
            ]},
            { "type": "field_input", "name": "NAME", "text": "field" },
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Struct field with explicit alignment (bytes)",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@align({{ALIGN}}) {{NAME}}: {{TYPE}},",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["ALIGN", "NAME", "TYPE"]
        }
    },

    // ============================================================================
    // BINDINGS & RESOURCES
    // ============================================================================

    {
        "type": "wgsl_storage_buffer",
        "message0": "Storage Buffer %1 Group: %2 Binding: %3 %4 Name: %5 Type: %6 %7 Access: %8",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "cells" },
            { "type": "field_input", "name": "TYPE", "text": "array<CellData>" },
            { "type": "input_dummy" },
            { "type": "field_dropdown", "name": "ACCESS", "options": [
                ["read", "read"],
                ["read_write", "read_write"]
            ]}
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Define a storage buffer binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar<storage, {{ACCESS}}> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": "StorageBuffer"
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME", "TYPE"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_storage_buffer_full",
        "message0": "@group( %1 ) @binding( %2 ) %3 var< storage , %4 > %5 : %6 ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_dropdown", "name": "ACCESS", "options": [
                ["read", "read"],
                ["read_write", "read_write"]
            ]},
            { "type": "field_input", "name": "NAME", "text": "buffer" },
            { "type": "field_input", "name": "TYPE", "text": "array<f32>" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Storage buffer binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar<storage, {{ACCESS}}> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": "StorageBuffer"
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME", "TYPE"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_uniform_buffer",
        "message0": "Uniform Buffer %1 Group: %2 Binding: %3 %4 Name: %5 Type: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "params" },
            { "type": "field_input", "name": "TYPE", "text": "PhysicsParams" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Define a uniform buffer binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar<uniform> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": "UniformBuffer"
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME", "TYPE"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_uniform_buffer_full",
        "message0": "@group( %1 ) @binding( %2 ) %3 var< uniform > %4 : %5 ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "uniforms" },
            { "type": "field_input", "name": "TYPE", "text": "Uniforms" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Uniform buffer binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar<uniform> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": "UniformBuffer"
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME", "TYPE"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_texture_2d",
        "message0": "@group( %1 ) @binding( %2 ) %3 var %4 : texture_2d< %5 > ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "texture" },
            { "type": "field_dropdown", "name": "FORMAT", "options": [
                ["f32", "f32"],
                ["i32", "i32"],
                ["u32", "u32"]
            ]}
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "2D texture binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar {{NAME}}: texture_2d<{{FORMAT}}>;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_sampler",
        "message0": "@group( %1 ) @binding( %2 ) %3 var %4 : sampler ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "sampler" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Sampler binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar {{NAME}}: sampler;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    // ============================================================================
    // VARIABLE DECLARATIONS
    // ============================================================================

    {
        "type": "wgsl_var_declare",
        "message0": "var %1 = %2",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "result" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Declare a variable",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "var {{NAME}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    {
        "type": "wgsl_let",
        "message0": "let %1 = %2 ;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "value" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Immutable variable declaration",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "let {{NAME}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    {
        "type": "wgsl_var_typed",
        "message0": "var %1 : %2 = %3 ;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "result" },
            { "type": "field_input", "name": "TYPE", "text": "f32" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Mutable variable with type",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "var {{NAME}}: {{TYPE}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE", "VALUE"]
        }
    },

    {
        "type": "wgsl_assign",
        "message0": "%1 = %2 ;",
        "args0": [
            { "type": "input_value", "name": "TARGET" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Assignment statement",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{TARGET}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET", "VALUE"]
        }
    },

    {
        "type": "wgsl_compound_assign",
        "message0": "%1 %2 %3 ;",
        "args0": [
            { "type": "input_value", "name": "TARGET" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+=", "+="],
                ["-=", "-="],
                ["*=", "*="],
                ["/=", "/="]
            ]},
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Compound assignment",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{TARGET}} {{OP}} {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET", "VALUE"]
        }
    },

    // ============================================================================
    // CONTROL FLOW
    // ============================================================================

    {
        "type": "wgsl_if",
        "message0": "if %1 %2 then %3",
        "args0": [
            { "type": "input_value", "name": "CONDITION" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Conditional statement",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "if ({{CONDITION}}) {\n{{THEN}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION", "THEN"]
        }
    },

    {
        "type": "wgsl_if_else",
        "message0": "if ( %1 ) { %2 %3 } else { %4 %5 }",
        "args0": [
            { "type": "input_value", "name": "CONDITION" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "THEN" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "ELSE" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "If-else statement",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "if ({{CONDITION}}) {\n{{THEN}}\n} else {\n{{ELSE}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION", "THEN", "ELSE"]
        }
    },

    {
        "type": "wgsl_for_loop",
        "message0": "for %1 from %2 to %3 %4 do %5",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "i" },
            { "type": "field_number", "name": "START", "value": 0 },
            { "type": "field_input", "name": "END", "text": "count" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "For loop iteration",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "for (var {{VAR}} = {{START}}; {{VAR}} < {{END}}; {{VAR}}++) {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VAR", "BODY"]
        }
    },

    {
        "type": "wgsl_for_loop_full",
        "message0": "for ( var %1 = %2 ; %3 ; %4 ) { %5 %6 }",
        "args0": [
            { "type": "field_input", "name": "VAR", "text": "i" },
            { "type": "input_value", "name": "INIT" },
            { "type": "input_value", "name": "CONDITION" },
            { "type": "input_value", "name": "UPDATE" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "For loop with full control",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "for (var {{VAR}} = {{INIT}}; {{CONDITION}}; {{UPDATE}}) {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["VAR", "BODY"]
        }
    },

    {
        "type": "wgsl_while",
        "message0": "while ( %1 ) { %2 %3 }",
        "args0": [
            { "type": "input_value", "name": "CONDITION" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "While loop",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "while ({{CONDITION}}) {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["CONDITION", "BODY"]
        }
    },

    {
        "type": "wgsl_loop",
        "message0": "loop { %1 %2 }",
        "args0": [
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Infinite loop",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "loop {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["BODY"]
        }
    },

    {
        "type": "wgsl_break",
        "message0": "break ;",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Break from loop",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "break;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    {
        "type": "wgsl_continue",
        "message0": "continue ;",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Continue to next iteration",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "continue;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    {
        "type": "wgsl_return",
        "message0": "return %1 ;",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": null,
        "colour": 270,
        "tooltip": "Return statement",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "return {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    // ============================================================================
    // VECTOR & MATRIX CONSTRUCTORS
    // ============================================================================

    {
        "type": "wgsl_vec2",
        "message0": "vec2< %1 >( %2 , %3 )",
        "args0": [
            { "type": "field_dropdown", "name": "TYPE", "options": [
                ["f32", "f32"],
                ["i32", "i32"],
                ["u32", "u32"]
            ]},
            { "type": "input_value", "name": "X" },
            { "type": "input_value", "name": "Y" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "2D vector constructor",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "vec2<{{TYPE}}>({{X}}, {{Y}})",
        "typeInfo": {
            "inputs": {
                "X": ["f32", "i32", "u32", "Number", "float", "int"],
                "Y": ["f32", "i32", "u32", "Number", "float", "int"]
            },
            "output": ["vec2<f32>", "Vec2"]
        },
        "validation": {
            "required": ["X", "Y"]
        }
    },

    {
        "type": "wgsl_vec3",
        "message0": "vec3(%1, %2, %3)",
        "args0": [
            { "type": "input_value", "name": "X" },
            { "type": "input_value", "name": "Y" },
            { "type": "input_value", "name": "Z" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Create a 3D vector",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "vec3<f32>({{X}}, {{Y}}, {{Z}})",
        "typeInfo": {
            "inputs": {
                "X": ["f32", "Number", "float"],
                "Y": ["f32", "Number", "float"],
                "Z": ["f32", "Number", "float"]
            },
            "output": ["vec3<f32>", "Vec3"]
        },
        "validation": {
            "required": ["X", "Y", "Z"]
        }
    },

    {
        "type": "wgsl_vec3_typed",
        "message0": "vec3< %1 >( %2 , %3 , %4 )",
        "args0": [
            { "type": "field_dropdown", "name": "TYPE", "options": [
                ["f32", "f32"],
                ["i32", "i32"],
                ["u32", "u32"]
            ]},
            { "type": "input_value", "name": "X" },
            { "type": "input_value", "name": "Y" },
            { "type": "input_value", "name": "Z" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "3D vector constructor",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "vec3<{{TYPE}}>({{X}}, {{Y}}, {{Z}})",
        "typeInfo": {
            "inputs": {
                "X": ["f32", "i32", "u32", "Number", "float", "int"],
                "Y": ["f32", "i32", "u32", "Number", "float", "int"],
                "Z": ["f32", "i32", "u32", "Number", "float", "int"]
            },
            "output": ["vec3<f32>", "Vec3"]
        },
        "validation": {
            "required": ["X", "Y", "Z"]
        }
    },

    {
        "type": "wgsl_vec4",
        "message0": "vec4< %1 >( %2 , %3 , %4 , %5 )",
        "args0": [
            { "type": "field_dropdown", "name": "TYPE", "options": [
                ["f32", "f32"],
                ["i32", "i32"],
                ["u32", "u32"]
            ]},
            { "type": "input_value", "name": "X" },
            { "type": "input_value", "name": "Y" },
            { "type": "input_value", "name": "Z" },
            { "type": "input_value", "name": "W" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "4D vector constructor",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "vec4<{{TYPE}}>({{X}}, {{Y}}, {{Z}}, {{W}})",
        "typeInfo": {
            "inputs": {
                "X": ["f32", "i32", "u32", "Number", "float", "int"],
                "Y": ["f32", "i32", "u32", "Number", "float", "int"],
                "Z": ["f32", "i32", "u32", "Number", "float", "int"],
                "W": ["f32", "i32", "u32", "Number", "float", "int"]
            },
            "output": ["vec4<f32>", "Vec4"]
        },
        "validation": {
            "required": ["X", "Y", "Z", "W"]
        }
    },

    {
        "type": "wgsl_mat4x4",
        "message0": "mat4x4< f32 >( %1 )",
        "args0": [
            { "type": "input_value", "name": "VALUES" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "4x4 matrix constructor",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "mat4x4<f32>({{VALUES}})",
        "typeInfo": {
            "inputs": {},
            "output": ["mat4x4<f32>"]
        },
        "validation": {}
    },

    // ============================================================================
    // BUILT-IN FUNCTIONS
    // ============================================================================

    {
        "type": "wgsl_builtin_func",
        "message0": "%1 ( %2 )",
        "args0": [
            { "type": "field_dropdown", "name": "FUNC", "options": [
                ["length", "length"],
                ["normalize", "normalize"],
                ["dot", "dot"],
                ["cross", "cross"],
                ["clamp", "clamp"],
                ["min", "min"],
                ["max", "max"],
                ["abs", "abs"],
                ["sqrt", "sqrt"]
            ]},
            { "type": "input_value", "name": "ARGS" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "WGSL built-in function",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{FUNC}}({{ARGS}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["ARGS"]
        }
    },

    {
        "type": "wgsl_math_func",
        "message0": "%1 ( %2 )",
        "args0": [
            { "type": "field_dropdown", "name": "FUNC", "options": [
                ["abs", "abs"],
                ["acos", "acos"],
                ["asin", "asin"],
                ["atan", "atan"],
                ["atan2", "atan2"],
                ["ceil", "ceil"],
                ["clamp", "clamp"],
                ["cos", "cos"],
                ["cross", "cross"],
                ["distance", "distance"],
                ["dot", "dot"],
                ["exp", "exp"],
                ["exp2", "exp2"],
                ["floor", "floor"],
                ["fract", "fract"],
                ["length", "length"],
                ["log", "log"],
                ["log2", "log2"],
                ["max", "max"],
                ["min", "min"],
                ["mix", "mix"],
                ["normalize", "normalize"],
                ["pow", "pow"],
                ["reflect", "reflect"],
                ["round", "round"],
                ["sign", "sign"],
                ["sin", "sin"],
                ["sqrt", "sqrt"],
                ["tan", "tan"],
                ["trunc", "trunc"]
            ]},
            { "type": "input_value", "name": "ARGS" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "WGSL math function",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{FUNC}}({{ARGS}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["ARGS"]
        }
    },

    {
        "type": "wgsl_texture_func",
        "message0": "%1 ( %2 , %3 , %4 )",
        "args0": [
            { "type": "field_dropdown", "name": "FUNC", "options": [
                ["textureSample", "textureSample"],
                ["textureLoad", "textureLoad"],
                ["textureStore", "textureStore"],
                ["textureDimensions", "textureDimensions"]
            ]},
            { "type": "input_value", "name": "TEXTURE" },
            { "type": "input_value", "name": "ARG1" },
            { "type": "input_value", "name": "ARG2" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Texture sampling function",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{FUNC}}({{TEXTURE}}, {{ARG1}}, {{ARG2}})",
        "typeInfo": {
            "inputs": {},
            "output": ["vec4<f32>", "Vec4"]
        },
        "validation": {
            "required": ["TEXTURE", "ARG1"]
        }
    },

    {
        "type": "wgsl_atomic_func",
        "message0": "%1 ( %2 , %3 )",
        "args0": [
            { "type": "field_dropdown", "name": "FUNC", "options": [
                ["atomicAdd", "atomicAdd"],
                ["atomicSub", "atomicSub"],
                ["atomicMax", "atomicMax"],
                ["atomicMin", "atomicMin"],
                ["atomicAnd", "atomicAnd"],
                ["atomicOr", "atomicOr"],
                ["atomicXor", "atomicXor"],
                ["atomicExchange", "atomicExchange"],
                ["atomicCompareExchangeWeak", "atomicCompareExchangeWeak"],
                ["atomicLoad", "atomicLoad"],
                ["atomicStore", "atomicStore"]
            ]},
            { "type": "input_value", "name": "PTR" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Atomic operation",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{FUNC}}({{PTR}}, {{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": ["i32", "u32", "int"]
        },
        "validation": {
            "required": ["PTR", "VALUE"]
        }
    },

    // ============================================================================
    // EXPRESSIONS
    // ============================================================================

    {
        "type": "wgsl_math_op",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "A" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+", "+"],
                ["-", "-"],
                ["*", "*"],
                ["/", "/"],
                ["<", "<"],
                [">", ">"],
                ["<=", "<="],
                [">=", ">="],
                ["==", "=="]
            ]},
            { "type": "input_value", "name": "B" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Math operation",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{A}} {{OP}} {{B}}",
        "typeInfo": {
            "inputs": {
                "A": ["f32", "i32", "u32", "Number", "float", "int"],
                "B": ["f32", "i32", "u32", "Number", "float", "int"]
            },
            "output": ["f32", "Number", "float", "bool", "Boolean"]
        },
        "validation": {
            "required": ["A", "B"]
        }
    },

    {
        "type": "wgsl_binary_op",
        "message0": "%1 %2 %3",
        "args0": [
            { "type": "input_value", "name": "LEFT" },
            { "type": "field_dropdown", "name": "OP", "options": [
                ["+", "+"],
                ["-", "-"],
                ["*", "*"],
                ["/", "/"],
                ["%", "%"],
                ["==", "=="],
                ["!=", "!="],
                ["<", "<"],
                [">", ">"],
                ["<=", "<="],
                [">=", ">="],
                ["&&", "&&"],
                ["||", "||"],
                ["&", "&"],
                ["|", "|"],
                ["^", "^"],
                ["<<", "<<"],
                [">>", ">>"]
            ]},
            { "type": "input_value", "name": "RIGHT" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Binary operation",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{LEFT}} {{OP}} {{RIGHT}}",
        "typeInfo": {
            "inputs": {
                "LEFT": ["f32", "i32", "u32", "Number", "float", "int", "bool", "Boolean"],
                "RIGHT": ["f32", "i32", "u32", "Number", "float", "int", "bool", "Boolean"]
            },
            "output": ["f32", "i32", "u32", "Number", "float", "int", "bool", "Boolean"]
        },
        "validation": {
            "required": ["LEFT", "RIGHT"]
        }
    },

    {
        "type": "wgsl_unary_op",
        "message0": "%1 %2",
        "args0": [
            { "type": "field_dropdown", "name": "OP", "options": [
                ["-", "-"],
                ["!", "!"],
                ["~", "~"],
                ["*", "*"],
                ["&", "&"]
            ]},
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Unary operation",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{OP}}{{EXPR}}",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "i32", "u32", "Number", "float", "int", "bool", "Boolean"]
        },
        "validation": {
            "required": ["EXPR"]
        }
    },

    {
        "type": "wgsl_cast",
        "message0": "%1 ( %2 )",
        "args0": [
            { "type": "field_dropdown", "name": "TYPE", "options": [
                ["f32", "f32"],
                ["i32", "i32"],
                ["u32", "u32"],
                ["bool", "bool"]
            ]},
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Type cast",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{TYPE}}({{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "i32", "u32", "bool", "Number", "float", "int", "Boolean"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // ============================================================================
    // LITERALS
    // ============================================================================

    {
        "type": "wgsl_number",
        "message0": "%1",
        "args0": [
            { "type": "field_number", "name": "VALUE", "value": 0 }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Number value",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{VALUE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {}
    },

    {
        "type": "wgsl_float",
        "message0": "%1",
        "args0": [
            { "type": "field_number", "name": "VALUE", "value": 0.0, "precision": 0.01 }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Float literal",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{VALUE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {}
    },

    {
        "type": "wgsl_int",
        "message0": "%1",
        "args0": [
            { "type": "field_number", "name": "VALUE", "value": 0 }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Integer literal",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{VALUE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["i32", "int"]
        },
        "validation": {}
    },

    {
        "type": "wgsl_bool",
        "message0": "%1",
        "args0": [
            { "type": "field_dropdown", "name": "VALUE", "options": [
                ["true", "true"],
                ["false", "false"]
            ]}
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Boolean literal",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{VALUE}}",
        "typeInfo": {
            "inputs": {},
            "output": ["bool", "Boolean"]
        },
        "validation": {}
    },

    // ============================================================================
    // VARIABLE & FIELD ACCESS
    // ============================================================================

    {
        "type": "wgsl_var_ref",
        "message0": "%1",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "variable" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Reference a variable",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{NAME}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME"]
        }
    },

    {
        "type": "wgsl_array_access",
        "message0": "%1 [ %2 ]",
        "args0": [
            { "type": "field_input", "name": "ARRAY", "text": "cells" },
            { "type": "input_value", "name": "INDEX" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Access array element",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{ARRAY}}[{{INDEX}}]",
        "typeInfo": {
            "inputs": {
                "INDEX": ["i32", "u32", "int"]
            },
            "output": null
        },
        "validation": {
            "required": ["ARRAY", "INDEX"]
        }
    },

    {
        "type": "wgsl_index",
        "message0": "%1 [ %2 ]",
        "args0": [
            { "type": "input_value", "name": "ARRAY" },
            { "type": "input_value", "name": "INDEX" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Index into array",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{ARRAY}}[{{INDEX}}]",
        "typeInfo": {
            "inputs": {
                "ARRAY": ["array"],
                "INDEX": ["i32", "u32", "int"]
            },
            "output": null
        },
        "validation": {
            "required": ["ARRAY", "INDEX"]
        }
    },

    {
        "type": "wgsl_array_length",
        "message0": "arrayLength( & %1 )",
        "args0": [
            { "type": "input_value", "name": "ARRAY" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Get the length of a runtime-sized array",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "arrayLength(&{{ARRAY}})",
        "typeInfo": {
            "inputs": {
                "ARRAY": ["array"]
            },
            "output": ["u32", "int"]
        },
        "validation": {
            "required": ["ARRAY"]
        }
    },

    {
        "type": "wgsl_field_access",
        "message0": "%1 . %2",
        "args0": [
            { "type": "input_value", "name": "OBJECT" },
            { "type": "field_input", "name": "FIELD", "text": "position" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Access struct field",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{OBJECT}}.{{FIELD}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["OBJECT", "FIELD"]
        }
    },

    // ============================================================================
    // FUNCTION DEFINITION
    // ============================================================================

    {
        "type": "wgsl_function",
        "message0": "fn %1 ( %2 ) -> %3 { %4 %5 }",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "my_function" },
            { "type": "field_input", "name": "PARAMS", "text": "x: f32, y: f32" },
            { "type": "field_input", "name": "RETURN_TYPE", "text": "f32" },
            { "type": "input_dummy" },
            { "type": "input_statement", "name": "BODY" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Function definition",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "fn {{NAME}}({{PARAMS}}) -> {{RETURN_TYPE}} {\n{{BODY}}\n}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "RETURN_TYPE", "BODY"]
        }
    },

    {
        "type": "wgsl_call",
        "message0": "%1 ( %2 )",
        "args0": [
            { "type": "field_input", "name": "FUNCTION", "text": "function" },
            { "type": "input_value", "name": "ARGS" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Function call",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{FUNCTION}}({{ARGS}})",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["FUNCTION"]
        }
    },

    // ============================================================================
    // COMMENTS
    // ============================================================================

    {
        "type": "wgsl_comment",
        "message0": "// %1",
        "args0": [
            { "type": "field_input", "name": "TEXT", "text": "comment" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Line comment",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "// {{TEXT}}",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    // ============================================================================
    // ADDITIONAL VARIABLE TYPES
    // ============================================================================

    {
        "type": "wgsl_const",
        "message0": "const %1 = %2 ;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "CONSTANT" },
            { "type": "input_value", "name": "VALUE" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Compile-time constant declaration",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "const {{NAME}} = {{VALUE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "VALUE"]
        }
    },

    {
        "type": "wgsl_override",
        "message0": "@id( %1 ) override %2 : %3 = %4 ;",
        "args0": [
            { "type": "field_number", "name": "ID", "value": 0, "min": 0 },
            { "type": "field_input", "name": "NAME", "text": "override_value" },
            { "type": "field_input", "name": "TYPE", "text": "f32" },
            { "type": "input_value", "name": "DEFAULT" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Pipeline-overridable constant",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@id({{ID}}) override {{NAME}}: {{TYPE}} = {{DEFAULT}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["ID", "NAME", "TYPE"]
        }
    },

    {
        "type": "wgsl_workgroup_var",
        "message0": "var< workgroup > %1 : %2 ;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "shared_data" },
            { "type": "field_input", "name": "TYPE", "text": "array<f32, 256>" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Workgroup-shared variable",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "var<workgroup> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    {
        "type": "wgsl_private_var",
        "message0": "var< private > %1 : %2 ;",
        "args0": [
            { "type": "field_input", "name": "NAME", "text": "private_var" },
            { "type": "field_input", "name": "TYPE", "text": "f32" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Private variable (per-invocation)",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "var<private> {{NAME}}: {{TYPE}};",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["NAME", "TYPE"]
        }
    },

    // ============================================================================
    // SYNCHRONIZATION
    // ============================================================================

    {
        "type": "wgsl_workgroup_barrier",
        "message0": "workgroupBarrier( ) ;",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Synchronize all invocations in a workgroup",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "workgroupBarrier();",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    {
        "type": "wgsl_storage_barrier",
        "message0": "storageBarrier( ) ;",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Memory barrier for storage operations",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "storageBarrier();",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {}
    },

    // ============================================================================
    // VECTOR SWIZZLING
    // ============================================================================

    {
        "type": "wgsl_swizzle",
        "message0": "%1 . %2",
        "args0": [
            { "type": "input_value", "name": "VECTOR" },
            { "type": "field_input", "name": "COMPONENTS", "text": "xyz" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Vector swizzle (e.g., .xyz, .xy, .rgb, .xxyy)",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "{{VECTOR}}.{{COMPONENTS}}",
        "typeInfo": {
            "inputs": {
                "VECTOR": ["vec2", "vec3", "vec4"]
            },
            "output": null
        },
        "validation": {
            "required": ["VECTOR", "COMPONENTS"]
        }
    },

    // ============================================================================
    // POINTER & ADDRESS OPERATIONS
    // ============================================================================

    {
        "type": "wgsl_address_of",
        "message0": "& %1",
        "args0": [
            { "type": "input_value", "name": "EXPR" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Get pointer/address of variable",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "&{{EXPR}}",
        "typeInfo": {
            "inputs": {},
            "output": ["ptr"]
        },
        "validation": {
            "required": ["EXPR"]
        }
    },

    {
        "type": "wgsl_dereference",
        "message0": "* %1",
        "args0": [
            { "type": "input_value", "name": "PTR" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Dereference pointer",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "*{{PTR}}",
        "typeInfo": {
            "inputs": {
                "PTR": ["ptr"]
            },
            "output": null
        },
        "validation": {
            "required": ["PTR"]
        }
    },

    // ============================================================================
    // ADDITIONAL TEXTURE TYPES
    // ============================================================================

    {
        "type": "wgsl_texture_storage_2d",
        "message0": "@group( %1 ) @binding( %2 ) %3 var %4 : texture_storage_2d< %5 , %6 > ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "output_texture" },
            { "type": "field_dropdown", "name": "FORMAT", "options": [
                ["rgba8unorm", "rgba8unorm"],
                ["rgba8snorm", "rgba8snorm"],
                ["rgba16float", "rgba16float"],
                ["rgba32float", "rgba32float"],
                ["r32float", "r32float"],
                ["rg32float", "rg32float"]
            ]},
            { "type": "field_dropdown", "name": "ACCESS", "options": [
                ["write", "write"],
                ["read_write", "read_write"]
            ]}
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Storage texture binding for compute shaders",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar {{NAME}}: texture_storage_2d<{{FORMAT}}, {{ACCESS}}>;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    {
        "type": "wgsl_texture_depth_2d",
        "message0": "@group( %1 ) @binding( %2 ) %3 var %4 : texture_depth_2d ;",
        "args0": [
            { "type": "field_number", "name": "GROUP", "value": 0, "min": 0 },
            { "type": "field_number", "name": "BINDING", "value": 0, "min": 0 },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "NAME", "text": "depth_texture" }
        ],
        "previousStatement": "TopLevel",
        "nextStatement": "TopLevel",
        "colour": 270,
        "tooltip": "Depth texture binding",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "@group({{GROUP}}) @binding({{BINDING}})\nvar {{NAME}}: texture_depth_2d;",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["GROUP", "BINDING", "NAME"],
            "constraints": {
                "GROUP": { "min": 0, "max": 3 },
                "BINDING": { "min": 0, "max": 15 }
            }
        }
    },

    // ============================================================================
    // ADDITIONAL MATH FUNCTIONS
    // ============================================================================

    {
        "type": "wgsl_select",
        "message0": "select( %1 , %2 , %3 )",
        "args0": [
            { "type": "input_value", "name": "FALSE_VALUE" },
            { "type": "input_value", "name": "TRUE_VALUE" },
            { "type": "input_value", "name": "CONDITION" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Select between two values based on condition (ternary-like)",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "select({{FALSE_VALUE}}, {{TRUE_VALUE}}, {{CONDITION}})",
        "typeInfo": {
            "inputs": {
                "CONDITION": ["bool", "Boolean"]
            },
            "output": null
        },
        "validation": {
            "required": ["FALSE_VALUE", "TRUE_VALUE", "CONDITION"]
        }
    },

    {
        "type": "wgsl_smoothstep",
        "message0": "smoothstep( %1 , %2 , %3 )",
        "args0": [
            { "type": "input_value", "name": "LOW" },
            { "type": "input_value", "name": "HIGH" },
            { "type": "input_value", "name": "X" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Smooth Hermite interpolation",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "smoothstep({{LOW}}, {{HIGH}}, {{X}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["LOW", "HIGH", "X"]
        }
    },

    {
        "type": "wgsl_step",
        "message0": "step( %1 , %2 )",
        "args0": [
            { "type": "input_value", "name": "EDGE" },
            { "type": "input_value", "name": "X" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Step function (0 if x < edge, else 1)",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "step({{EDGE}}, {{X}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["EDGE", "X"]
        }
    },

    {
        "type": "wgsl_fma",
        "message0": "fma( %1 , %2 , %3 )",
        "args0": [
            { "type": "input_value", "name": "A" },
            { "type": "input_value", "name": "B" },
            { "type": "input_value", "name": "C" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Fused multiply-add: a * b + c",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "fma({{A}}, {{B}}, {{C}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["A", "B", "C"]
        }
    },

    {
        "type": "wgsl_saturate",
        "message0": "saturate( %1 )",
        "args0": [
            { "type": "input_value", "name": "VALUE" }
        ],
        "output": null,
        "colour": 270,
        "tooltip": "Clamp value to [0, 1] range",
        "helpUrl": "",
        "mode": "wgsl",
        "template": "saturate({{VALUE}})",
        "typeInfo": {
            "inputs": {},
            "output": ["f32", "Number", "float"]
        },
        "validation": {
            "required": ["VALUE"]
        }
    },

    // ============================================================================
    // CROSS-MODE REFERENCE BLOCKS
    // ============================================================================

    // Reference Node - Links to code in another file or mode
    {
        "type": "wgsl_reference_node",
        "message0": "Reference 🔗 %1 Target File: %2 %3 Symbol: %4 %5 Description: %6",
        "args0": [
            { "type": "input_dummy" },
            { "type": "field_input", "name": "TARGET_FILE", "text": "main.rs" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "TARGET_SYMBOL", "text": "" },
            { "type": "input_dummy" },
            { "type": "field_input", "name": "DESCRIPTION", "text": "" }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 270,
        "tooltip": "Create a reference to code in another file or mode. Used for cross-mode imports and dependencies.",
        "helpUrl": "",
        "mode": "wgsl",
        "typeInfo": {
            "inputs": {},
            "output": null
        },
        "validation": {
            "required": ["TARGET_FILE"]
        }
    }
]);
