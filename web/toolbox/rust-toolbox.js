// Rust Toolbox Definition
// Consolidated toolbox for Rust mode
// Requirements: 1.1, 1.3, 4.4, 9.1, 9.2, 10.2

const RustToolbox = {
    mode: "rust",
    displayName: "Rust",
    color: "#CE422B",
    
    // Toolbox structure
    getToolbox: function() {
        return {
            kind: "categoryToolbox",
            contents: [
                // File Organization
                {
                    kind: "category",
                    name: "Files",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "file_container" },
                        { kind: "label", text: "Link Files" },
                        { kind: "block", type: "rust_mod_file" },
                        { kind: "label", text: "Modules" },
                        { kind: "block", type: "rust_mod" },
                        { kind: "label", text: "Imports" },
                        { kind: "block", type: "rust_use" },
                        { kind: "block", type: "rust_pub_use" },
                        { kind: "block", type: "rust_extern_crate" },
                        { kind: "label", text: "Comments" },
                        { kind: "block", type: "rust_comment" }
                    ]
                },
                
                // Functions & Methods
                {
                    kind: "category",
                    name: "Functions",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_main" },
                        { kind: "block", type: "rust_function" },
                        { kind: "block", type: "rust_pub_function" },
                        { kind: "block", type: "rust_method" },
                        { kind: "block", type: "rust_parameters" },
                        { kind: "block", type: "rust_return_type" },
                        { kind: "block", type: "rust_return" }
                    ]
                },
                
                // Control Flow
                {
                    kind: "category",
                    name: "Control Flow",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_if" },
                        { kind: "block", type: "rust_if_else" },
                        { kind: "block", type: "rust_match" },
                        { kind: "block", type: "rust_match_arm" },
                        { kind: "block", type: "rust_while" },
                        { kind: "block", type: "rust_loop" },
                        { kind: "block", type: "rust_for_range" },
                        { kind: "block", type: "rust_for_iter" },
                        { kind: "block", type: "rust_for_each" },
                        { kind: "block", type: "rust_if_let" },
                        { kind: "block", type: "rust_if_let_some" },
                        { kind: "block", type: "rust_if_let_ok" },
                        { kind: "block", type: "rust_break" },
                        { kind: "block", type: "rust_continue" }
                    ]
                },
                
                // Variables & Assignments
                {
                    kind: "category",
                    name: "Variables",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_let" },
                        { kind: "block", type: "rust_let_binding" },
                        { kind: "block", type: "rust_type_annotation" },
                        { kind: "block", type: "rust_assign" },
                        { kind: "block", type: "rust_assignment" },
                        { kind: "block", type: "rust_compound_assign" },
                        { kind: "block", type: "rust_var" }
                    ]
                },
                
                // Expressions & Operations
                {
                    kind: "category",
                    name: "Expressions",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_binary_op" },
                        { kind: "block", type: "rust_unary_op" },
                        { kind: "block", type: "rust_call" },
                        { kind: "block", type: "rust_method_call" },
                        { kind: "block", type: "rust_field_access" },
                        { kind: "block", type: "rust_index" },
                        { kind: "block", type: "rust_tuple_access" },
                        { kind: "block", type: "rust_cast" },
                        { kind: "block", type: "rust_expr_stmt" }
                    ]
                },
                
                // Literals
                {
                    kind: "category",
                    name: "Literals",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_number" },
                        { kind: "block", type: "rust_float" },
                        { kind: "block", type: "rust_string" },
                        { kind: "block", type: "rust_bool" }
                    ]
                },
                
                // Structs & Enums
                {
                    kind: "category",
                    name: "Structs & Enums",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_struct" },
                        { kind: "block", type: "rust_field" },
                        { kind: "block", type: "rust_struct_init" },
                        { kind: "block", type: "rust_field_init" },
                        { kind: "block", type: "rust_tuple_struct" },
                        { kind: "block", type: "rust_enum_variant" },
                        { kind: "block", type: "rust_enum_variant_value" },
                        { kind: "block", type: "rust_impl" },
                        { kind: "block", type: "rust_impl_trait" }
                    ]
                },
                
                // Option & Result
                {
                    kind: "category",
                    name: "Option & Result",
                    colour: 20,
                    contents: [
                        { kind: "label", text: "Option" },
                        { kind: "block", type: "rust_option_some" },
                        { kind: "block", type: "rust_option_none" },
                        { kind: "block", type: "rust_is_some" },
                        { kind: "block", type: "rust_is_none" },
                        { kind: "label", text: "Result" },
                        { kind: "block", type: "rust_result_ok" },
                        { kind: "block", type: "rust_result_err" },
                        { kind: "block", type: "rust_is_ok" },
                        { kind: "block", type: "rust_is_err" },
                        { kind: "label", text: "Unwrapping" },
                        { kind: "block", type: "rust_unwrap" },
                        { kind: "block", type: "rust_unwrap_or" },
                        { kind: "block", type: "rust_expect" },
                        { kind: "block", type: "rust_question_mark" }
                    ]
                },
                
                // Collections
                {
                    kind: "category",
                    name: "Collections",
                    colour: 20,
                    contents: [
                        { kind: "label", text: "Vectors" },
                        { kind: "block", type: "rust_vec_new" },
                        { kind: "block", type: "rust_vec_macro" },
                        { kind: "block", type: "rust_vec_push" },
                        { kind: "block", type: "rust_vec_len" },
                        { kind: "label", text: "Arrays" },
                        { kind: "block", type: "rust_array_literal" },
                        { kind: "block", type: "rust_array_typed" },
                        { kind: "block", type: "rust_array_len" },
                        { kind: "block", type: "rust_array_is_empty" },
                        { kind: "label", text: "Slices & Ranges" },
                        { kind: "block", type: "rust_slice" },
                        { kind: "block", type: "rust_range" },
                        { kind: "block", type: "rust_range_inclusive" },
                        { kind: "label", text: "Iterators - Creation" },
                        { kind: "block", type: "rust_iter" },
                        { kind: "block", type: "rust_iter_mut" },
                        { kind: "block", type: "rust_into_iter" },
                        { kind: "label", text: "Iterators - Transformation" },
                        { kind: "block", type: "rust_iter_map" },
                        { kind: "block", type: "rust_iter_filter" },
                        { kind: "block", type: "rust_iter_enumerate" },
                        { kind: "block", type: "rust_iter_zip" },
                        { kind: "block", type: "rust_iter_chain" },
                        { kind: "block", type: "rust_iter_reverse" },
                        { kind: "block", type: "rust_iter_take" },
                        { kind: "block", type: "rust_iter_skip" },
                        { kind: "label", text: "Iterators - Aggregation" },
                        { kind: "block", type: "rust_iter_collect" },
                        { kind: "block", type: "rust_iter_collect_typed" },
                        { kind: "block", type: "rust_iter_fold" },
                        { kind: "block", type: "rust_iter_sum" },
                        { kind: "block", type: "rust_iter_count" },
                        { kind: "block", type: "rust_iter_max" },
                        { kind: "block", type: "rust_iter_min" },
                        { kind: "label", text: "Iterators - Searching" },
                        { kind: "block", type: "rust_iter_any" },
                        { kind: "block", type: "rust_iter_all" },
                        { kind: "block", type: "rust_iter_find" }
                    ]
                },
                
                // Strings
                {
                    kind: "category",
                    name: "Strings",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_string_new" },
                        { kind: "block", type: "rust_string_from" },
                        { kind: "block", type: "rust_string_literal" },
                        { kind: "block", type: "rust_string_concat" },
                        { kind: "block", type: "rust_to_string" },
                        { kind: "block", type: "rust_string_as_str" },
                        { kind: "label", text: "Modification" },
                        { kind: "block", type: "rust_string_push_str" },
                        { kind: "block", type: "rust_string_push" },
                        { kind: "block", type: "rust_string_clear" },
                        { kind: "label", text: "Inspection" },
                        { kind: "block", type: "rust_string_len" },
                        { kind: "block", type: "rust_string_is_empty" },
                        { kind: "block", type: "rust_string_contains" },
                        { kind: "block", type: "rust_string_starts_with" },
                        { kind: "block", type: "rust_string_ends_with" },
                        { kind: "label", text: "Transformation" },
                        { kind: "block", type: "rust_string_trim" },
                        { kind: "block", type: "rust_string_trim_start" },
                        { kind: "block", type: "rust_string_trim_end" },
                        { kind: "block", type: "rust_string_to_lowercase" },
                        { kind: "block", type: "rust_string_to_uppercase" },
                        { kind: "block", type: "rust_string_replace" },
                        { kind: "block", type: "rust_string_replacen" },
                        { kind: "label", text: "Splitting & Iteration" },
                        { kind: "block", type: "rust_string_split" },
                        { kind: "block", type: "rust_string_split_whitespace" },
                        { kind: "block", type: "rust_string_lines" },
                        { kind: "block", type: "rust_string_chars" },
                        { kind: "block", type: "rust_string_bytes" },
                        { kind: "label", text: "Parsing & Slicing" },
                        { kind: "block", type: "rust_string_parse" },
                        { kind: "block", type: "rust_string_parse_typed" },
                        { kind: "block", type: "rust_string_slice" }
                    ]
                },
                
                // Math
                {
                    kind: "category",
                    name: "Math",
                    colour: 20,
                    contents: [
                        { kind: "label", text: "Basic Operations" },
                        { kind: "block", type: "rust_abs" },
                        { kind: "block", type: "rust_min" },
                        { kind: "block", type: "rust_max" },
                        { kind: "block", type: "rust_clamp" },
                        { kind: "block", type: "rust_signum" },
                        { kind: "label", text: "Powers & Roots" },
                        { kind: "block", type: "rust_pow" },
                        { kind: "block", type: "rust_sqrt" },
                        { kind: "block", type: "rust_cbrt" },
                        { kind: "label", text: "Rounding" },
                        { kind: "block", type: "rust_floor" },
                        { kind: "block", type: "rust_ceil" },
                        { kind: "block", type: "rust_round" },
                        { kind: "block", type: "rust_trunc" },
                        { kind: "block", type: "rust_fract" },
                        { kind: "label", text: "Trigonometry" },
                        { kind: "block", type: "rust_sin" },
                        { kind: "block", type: "rust_cos" },
                        { kind: "block", type: "rust_tan" },
                        { kind: "block", type: "rust_asin" },
                        { kind: "block", type: "rust_acos" },
                        { kind: "block", type: "rust_atan" },
                        { kind: "block", type: "rust_atan2" },
                        { kind: "block", type: "rust_to_radians" },
                        { kind: "block", type: "rust_to_degrees" },
                        { kind: "label", text: "Exponentials & Logarithms" },
                        { kind: "block", type: "rust_exp" },
                        { kind: "block", type: "rust_exp2" },
                        { kind: "block", type: "rust_ln" },
                        { kind: "block", type: "rust_log2" },
                        { kind: "block", type: "rust_log10" },
                        { kind: "block", type: "rust_log" },
                        { kind: "label", text: "Constants" },
                        { kind: "block", type: "rust_pi" },
                        { kind: "block", type: "rust_e" },
                        { kind: "block", type: "rust_tau" },
                        { kind: "label", text: "Checks" },
                        { kind: "block", type: "rust_is_sign_positive" },
                        { kind: "block", type: "rust_is_sign_negative" },
                        { kind: "block", type: "rust_is_finite" },
                        { kind: "block", type: "rust_is_infinite" },
                        { kind: "block", type: "rust_is_nan" }
                    ]
                },
                
                // Macros
                {
                    kind: "category",
                    name: "Macros",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_println" },
                        { kind: "block", type: "rust_print" },
                        { kind: "block", type: "rust_format" },
                        { kind: "block", type: "rust_format_macro" },
                        { kind: "block", type: "rust_format_single" },
                        { kind: "block", type: "rust_dbg" },
                        { kind: "block", type: "rust_panic" },
                        { kind: "block", type: "rust_assert" },
                        { kind: "block", type: "rust_assert_eq" }
                    ]
                },
                
                // Comments
                {
                    kind: "category",
                    name: "Comments",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_comment" },
                        { kind: "block", type: "rust_doc_comment" },
                        { kind: "block", type: "rust_block_comment" }
                    ]
                },
                
                // Advanced Features
                {
                    kind: "category",
                    name: "Advanced",
                    colour: 20,
                    contents: [
                        { kind: "label", text: "Async/Await" },
                        { kind: "block", type: "rust_async_function" },
                        { kind: "block", type: "rust_await" },
                        { kind: "block", type: "rust_async_block" },
                        { kind: "label", text: "Lifetimes" },
                        { kind: "block", type: "rust_lifetime_param" },
                        { kind: "block", type: "rust_lifetime_annotation" },
                        { kind: "label", text: "Traits" },
                        { kind: "block", type: "rust_trait_def" },
                        { kind: "block", type: "rust_trait_method" },
                        { kind: "label", text: "Modules" },
                        { kind: "block", type: "rust_mod" },
                        { kind: "block", type: "rust_mod_file" },
                        { kind: "block", type: "rust_use" },
                        { kind: "block", type: "rust_pub_use" },
                        { kind: "block", type: "rust_extern_crate" }
                    ]
                },
                
                // Cross-Mode References
                {
                    kind: "category",
                    name: "References",
                    colour: 20,
                    contents: [
                        { kind: "block", type: "rust_reference_node" }
                    ]
                }
            ]
        };
    }
};
