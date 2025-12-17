// WGSL Toolbox Definition
// Consolidated toolbox for WGSL mode
// Requirements: 1.2, 1.3, 4.4, 9.1, 9.2, 10.3

const WgslToolbox = {
    mode: "wgsl",
    displayName: "WGSL",
    color: "#8B5CF6",
    
    // Toolbox structure
    getToolbox: function() {
        return {
            kind: "categoryToolbox",
            contents: [
                // File Organization
                {
                    kind: "category",
                    name: "Files",
                    colour: 270,
                    contents: [
                        { kind: "block", type: "wgsl_file_container" }
                    ]
                },

                // Shader Entry Points
                {
                    kind: "category",
                    name: "Shaders",
                    colour: 270,
                    contents: [
                        { kind: "block", type: "wgsl_compute_shader" },
                        { kind: "block", type: "wgsl_compute_shader_full" },
                        { kind: "block", type: "wgsl_vertex_shader" },
                        { kind: "block", type: "wgsl_fragment_shader" }
                    ]
                },

                // Structs
                {
                    kind: "category",
                    name: "Structs",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Struct Definition" },
                        { kind: "block", type: "wgsl_struct" },
                        { kind: "label", text: "Struct Fields" },
                        { kind: "block", type: "wgsl_struct_field" },
                        { kind: "block", type: "wgsl_struct_field_location" },
                        { kind: "block", type: "wgsl_struct_field_builtin" },
                        { kind: "block", type: "wgsl_struct_field_align" }
                    ]
                },

                // Bindings & Resources
                {
                    kind: "category",
                    name: "Bindings",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Buffers" },
                        { kind: "block", type: "wgsl_storage_buffer" },
                        { kind: "block", type: "wgsl_storage_buffer_full" },
                        { kind: "block", type: "wgsl_uniform_buffer" },
                        { kind: "block", type: "wgsl_uniform_buffer_full" },
                        { kind: "label", text: "Textures" },
                        { kind: "block", type: "wgsl_texture_2d" },
                        { kind: "block", type: "wgsl_texture_storage_2d" },
                        { kind: "block", type: "wgsl_texture_depth_2d" },
                        { kind: "block", type: "wgsl_sampler" }
                    ]
                },

                // Variables
                {
                    kind: "category",
                    name: "Variables",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Declarations" },
                        { kind: "block", type: "wgsl_var_declare" },
                        { kind: "block", type: "wgsl_let" },
                        { kind: "block", type: "wgsl_var_typed" },
                        { kind: "label", text: "Constants" },
                        { kind: "block", type: "wgsl_const" },
                        { kind: "block", type: "wgsl_override" },
                        { kind: "label", text: "Special Variables" },
                        { kind: "block", type: "wgsl_workgroup_var" },
                        { kind: "block", type: "wgsl_private_var" },
                        { kind: "label", text: "Assignment" },
                        { kind: "block", type: "wgsl_assign" },
                        { kind: "block", type: "wgsl_compound_assign" },
                        { kind: "label", text: "References" },
                        { kind: "block", type: "wgsl_var_ref" }
                    ]
                },

                // Control Flow
                {
                    kind: "category",
                    name: "Control Flow",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Conditionals" },
                        { kind: "block", type: "wgsl_if" },
                        { kind: "block", type: "wgsl_if_else" },
                        { kind: "label", text: "Loops" },
                        { kind: "block", type: "wgsl_for_loop" },
                        { kind: "block", type: "wgsl_for_loop_full" },
                        { kind: "block", type: "wgsl_while" },
                        { kind: "block", type: "wgsl_loop" },
                        { kind: "label", text: "Loop Control" },
                        { kind: "block", type: "wgsl_break" },
                        { kind: "block", type: "wgsl_continue" },
                        { kind: "label", text: "Synchronization" },
                        { kind: "block", type: "wgsl_workgroup_barrier" },
                        { kind: "block", type: "wgsl_storage_barrier" },
                        { kind: "label", text: "Return" },
                        { kind: "block", type: "wgsl_return" }
                    ]
                },

                // Vectors & Matrices
                {
                    kind: "category",
                    name: "Vectors & Matrices",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Vector Constructors" },
                        { kind: "block", type: "wgsl_vec2" },
                        { kind: "block", type: "wgsl_vec3" },
                        { kind: "block", type: "wgsl_vec3_typed" },
                        { kind: "block", type: "wgsl_vec4" },
                        { kind: "label", text: "Matrix Constructors" },
                        { kind: "block", type: "wgsl_mat4x4" }
                    ]
                },

                // Built-in Functions
                {
                    kind: "category",
                    name: "Built-in Functions",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "General" },
                        { kind: "block", type: "wgsl_builtin_func" },
                        { kind: "block", type: "wgsl_math_func" },
                        { kind: "label", text: "Advanced Math" },
                        { kind: "block", type: "wgsl_select" },
                        { kind: "block", type: "wgsl_smoothstep" },
                        { kind: "block", type: "wgsl_step" },
                        { kind: "block", type: "wgsl_fma" },
                        { kind: "block", type: "wgsl_saturate" },
                        { kind: "label", text: "Texture Functions" },
                        { kind: "block", type: "wgsl_texture_func" },
                        { kind: "label", text: "Atomic Operations" },
                        { kind: "block", type: "wgsl_atomic_func" }
                    ]
                },

                // Expressions & Operations
                {
                    kind: "category",
                    name: "Expressions",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Binary Operations" },
                        { kind: "block", type: "wgsl_math_op" },
                        { kind: "block", type: "wgsl_binary_op" },
                        { kind: "label", text: "Unary Operations" },
                        { kind: "block", type: "wgsl_unary_op" },
                        { kind: "label", text: "Type Casting" },
                        { kind: "block", type: "wgsl_cast" }
                    ]
                },

                // Literals
                {
                    kind: "category",
                    name: "Literals",
                    colour: 270,
                    contents: [
                        { kind: "block", type: "wgsl_number" },
                        { kind: "block", type: "wgsl_float" },
                        { kind: "block", type: "wgsl_int" },
                        { kind: "block", type: "wgsl_bool" }
                    ]
                },

                // Array & Field Access
                {
                    kind: "category",
                    name: "Access",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Array Access" },
                        { kind: "block", type: "wgsl_array_access" },
                        { kind: "block", type: "wgsl_index" },
                        { kind: "block", type: "wgsl_array_length" },
                        { kind: "label", text: "Field Access" },
                        { kind: "block", type: "wgsl_field_access" },
                        { kind: "block", type: "wgsl_swizzle" },
                        { kind: "label", text: "Pointer Operations" },
                        { kind: "block", type: "wgsl_address_of" },
                        { kind: "block", type: "wgsl_dereference" }
                    ]
                },

                // Functions
                {
                    kind: "category",
                    name: "Functions",
                    colour: 270,
                    contents: [
                        { kind: "label", text: "Definition" },
                        { kind: "block", type: "wgsl_function" },
                        { kind: "label", text: "Calling" },
                        { kind: "block", type: "wgsl_call" }
                    ]
                },

                // Comments & References
                {
                    kind: "category",
                    name: "Comments & References",
                    colour: 270,
                    contents: [
                        { kind: "block", type: "wgsl_comment" },
                        { kind: "block", type: "wgsl_reference_node" }
                    ]
                }
            ]
        };
    }
};
