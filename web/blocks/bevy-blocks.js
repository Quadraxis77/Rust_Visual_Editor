// Bevy ECS Blocks - Consolidated
// Mode: bevy
// Naming convention: bevy_*
// Includes: Systems, Queries, Resources, Commands, Events, Components

Blockly.defineBlocksWithJsonArray([
    // ============================================================================
    // PLUGIN BLOCKS
    // ============================================================================

    {
        type: "bevy_plugin",
        message0: "Plugin %1 Name: %2 %3 Build: %4",
        args0: [
            { type: "input_dummy" },
            { type: "field_input", name: "NAME", text: "MyPlugin" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BUILD" }
        ],
        colour: 120,
        tooltip: "Define a Bevy plugin",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["NAME"],
            constraints: {
                NAME: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_plugin_impl",
        message0: "impl Plugin for %1 %2 fn build(&self, app: &mut App) %3 %4",
        args0: [
            { type: "field_input", name: "NAME", text: "MyPlugin" },
            { type: "input_dummy" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        colour: 120,
        tooltip: "Implement Plugin trait",
        helpUrl: "",
        mode: "bevy",
        template: "impl Plugin for {{NAME}} {\n    fn build(&self, app: &mut App) {\n        {{BODY}}\n    }\n}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["NAME"],
            constraints: {
                NAME: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    // ============================================================================
    // APP CONFIGURATION BLOCKS
    // ============================================================================

    {
        type: "bevy_add_systems",
        message0: "app.add_systems( %1 , %2 )",
        args0: [
            { type: "field_dropdown", name: "SCHEDULE", options: [
                ["Startup", "STARTUP"],
                ["Update", "UPDATE"],
                ["PreUpdate", "PRE_UPDATE"],
                ["PostUpdate", "POST_UPDATE"],
                ["FixedUpdate", "FIXED_UPDATE"],
                ["First", "FIRST"],
                ["Last", "LAST"]
            ]},
            { type: "input_value", name: "SYSTEMS" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Add systems to app schedule",
        helpUrl: "",
        mode: "bevy",
        template: "app.add_systems({{SCHEDULE}}, {{SYSTEMS}});",
        typeInfo: {
            inputs: {
                SYSTEMS: ["SystemSet", "System"]
            },
            output: null
        },
        validation: {
            required: ["SCHEDULE", "SYSTEMS"]
        }
    },

    {
        type: "bevy_add_plugins",
        message0: "app.add_plugins( %1 )",
        args0: [
            { type: "input_value", name: "PLUGIN" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Add plugin to app",
        helpUrl: "",
        mode: "bevy",
        template: "app.add_plugins({{PLUGIN}});",
        typeInfo: {
            inputs: {
                PLUGIN: ["Plugin"]
            },
            output: null
        },
        validation: {
            required: ["PLUGIN"]
        }
    },

    {
        type: "bevy_init_resource",
        message0: "app.init_resource::< %1 >()",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyResource" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Initialize resource with Default",
        helpUrl: "",
        mode: "bevy",
        template: "app.init_resource::<{{TYPE}}>();",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_insert_resource",
        message0: "app.insert_resource( %1 )",
        args0: [
            { type: "input_value", name: "RESOURCE" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Insert resource into app",
        helpUrl: "",
        mode: "bevy",
        template: "app.insert_resource({{RESOURCE}});",
        typeInfo: {
            inputs: {
                RESOURCE: ["Resource"]
            },
            output: null
        },
        validation: {
            required: ["RESOURCE"]
        }
    },

    {
        type: "bevy_add_event",
        message0: "app.add_event::< %1 >()",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyEvent" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Add event type",
        helpUrl: "",
        mode: "bevy",
        template: "app.add_event::<{{TYPE}}>();",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    // ============================================================================
    // SYSTEM DEFINITION BLOCKS
    // ============================================================================

    {
        type: "bevy_system",
        message0: "fn %1 ( %2 ) %3 %4",
        args0: [
            { type: "field_input", name: "NAME", text: "my_system" },
            { type: "input_value", name: "PARAMS", check: "SystemParams" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        previousStatement: "TopLevel",
        nextStatement: "TopLevel",
        colour: 120,
        tooltip: "Define a Bevy system function",
        helpUrl: "",
        mode: "bevy",
        template: "fn {{NAME}}({{PARAMS}}) {\n    {{BODY}}\n}",
        typeInfo: {
            inputs: {
                PARAMS: ["SystemParams"]
            },
            output: "System"
        },
        validation: {
            required: ["NAME"],
            constraints: {
                NAME: { pattern: /^[a-z][a-z0-9_]*$/ }
            }
        }
    },

    // ============================================================================
    // SYSTEM PARAMETER BLOCKS
    // ============================================================================

    {
        type: "bevy_query",
        message0: "Query< %1 %2 %3 >",
        args0: [
            { type: "input_value", name: "COMPONENTS", check: "Components" },
            { type: "input_dummy" },
            { type: "input_value", name: "FILTER", check: "QueryFilter" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Query system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Query<{{COMPONENTS}}{{FILTER}}>",
        typeInfo: {
            inputs: {
                COMPONENTS: ["Components"],
                FILTER: ["QueryFilter"]
            },
            output: ["SystemParam", "Query"]
        },
        validation: {
            required: ["COMPONENTS"]
        }
    },

    {
        type: "bevy_query_components",
        message0: "%1",
        args0: [
            { type: "field_input", name: "COMPONENTS", text: "&mut Transform, &Cell" }
        ],
        output: "Components",
        colour: 120,
        tooltip: "Query components",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMPONENTS}}",
        typeInfo: {
            inputs: {},
            output: ["Components"]
        },
        validation: {
            required: ["COMPONENTS"]
        }
    },

    {
        type: "bevy_query_filter",
        message0: ", %1",
        args0: [
            { type: "field_input", name: "FILTER", text: "With<Visible>" }
        ],
        output: "QueryFilter",
        colour: 120,
        tooltip: "Query filter",
        helpUrl: "",
        mode: "bevy",
        template: ", {{FILTER}}",
        typeInfo: {
            inputs: {},
            output: ["QueryFilter"]
        },
        validation: {
            required: ["FILTER"]
        }
    },

    {
        type: "bevy_res",
        message0: "Res< %1 >",
        args0: [
            { type: "field_input", name: "TYPE", text: "Time" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Immutable resource parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Res<{{TYPE}}>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Res", "Resource"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_res_mut",
        message0: "ResMut< %1 >",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyResource" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Mutable resource parameter",
        helpUrl: "",
        mode: "bevy",
        template: "ResMut<{{TYPE}}>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "ResMut", "Resource"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_commands",
        message0: "Commands",
        output: "SystemParam",
        colour: 120,
        tooltip: "Commands system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Commands",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Commands"]
        },
        validation: {}
    },

    {
        type: "bevy_time",
        message0: "Res< Time >",
        output: "SystemParam",
        colour: 120,
        tooltip: "Time resource",
        helpUrl: "",
        mode: "bevy",
        template: "Res<Time>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Res", "Resource"]
        },
        validation: {}
    },

    {
        type: "bevy_assets",
        message0: "ResMut< Assets< %1 > >",
        args0: [
            { type: "field_input", name: "TYPE", text: "Mesh" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Assets collection",
        helpUrl: "",
        mode: "bevy",
        template: "ResMut<Assets<{{TYPE}}>>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "ResMut", "Resource"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_event_reader",
        message0: "EventReader< %1 >",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyEvent" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Event reader parameter",
        helpUrl: "",
        mode: "bevy",
        template: "EventReader<{{TYPE}}>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "EventReader"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_event_writer",
        message0: "EventWriter< %1 >",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyEvent" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Event writer parameter",
        helpUrl: "",
        mode: "bevy",
        template: "EventWriter<{{TYPE}}>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "EventWriter"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    {
        type: "bevy_local",
        message0: "Local< %1 >",
        args0: [
            { type: "field_input", name: "TYPE", text: "MyLocalState" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Local system state",
        helpUrl: "",
        mode: "bevy",
        template: "Local<{{TYPE}}>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Local"]
        },
        validation: {
            required: ["TYPE"],
            constraints: {
                TYPE: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    // ============================================================================
    // QUERY OPERATIONS
    // ============================================================================

    {
        type: "bevy_query_iter",
        message0: "%1 .iter()",
        args0: [
            { type: "input_value", name: "QUERY" }
        ],
        output: "Iterator",
        colour: 120,
        tooltip: "Iterate over query (immutable)",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.iter()",
        typeInfo: {
            inputs: {
                QUERY: ["Query"]
            },
            output: ["Iterator"]
        },
        validation: {
            required: ["QUERY"]
        }
    },

    {
        type: "bevy_query_iter_mut",
        message0: "%1 .iter_mut()",
        args0: [
            { type: "input_value", name: "QUERY" }
        ],
        output: "Iterator",
        colour: 120,
        tooltip: "Iterate over query (mutable)",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.iter_mut()",
        typeInfo: {
            inputs: {
                QUERY: ["Query"]
            },
            output: ["Iterator"]
        },
        validation: {
            required: ["QUERY"]
        }
    },

    {
        type: "bevy_query_single",
        message0: "%1 .single()",
        args0: [
            { type: "input_value", name: "QUERY" }
        ],
        output: "QueryResult",
        colour: 120,
        tooltip: "Get single query result",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.single()",
        typeInfo: {
            inputs: {
                QUERY: ["Query"]
            },
            output: ["QueryResult"]
        },
        validation: {
            required: ["QUERY"]
        }
    },

    {
        type: "bevy_query_single_mut",
        message0: "%1 .single_mut()",
        args0: [
            { type: "input_value", name: "QUERY" }
        ],
        output: "QueryResult",
        colour: 120,
        tooltip: "Get single query result (mutable)",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.single_mut()",
        typeInfo: {
            inputs: {
                QUERY: ["Query"]
            },
            output: ["QueryResult"]
        },
        validation: {
            required: ["QUERY"]
        }
    },

    {
        type: "bevy_query_get",
        message0: "%1 .get( %2 )",
        args0: [
            { type: "input_value", name: "QUERY" },
            { type: "input_value", name: "ENTITY", check: "Entity" }
        ],
        output: "QueryResult",
        colour: 120,
        tooltip: "Get query result for entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.get({{ENTITY}})",
        typeInfo: {
            inputs: {
                QUERY: ["Query"],
                ENTITY: ["Entity"]
            },
            output: ["QueryResult"]
        },
        validation: {
            required: ["QUERY", "ENTITY"]
        }
    },

    {
        type: "bevy_query_get_mut",
        message0: "%1 .get_mut( %2 )",
        args0: [
            { type: "input_value", name: "QUERY" },
            { type: "input_value", name: "ENTITY", check: "Entity" }
        ],
        output: "QueryResult",
        colour: 120,
        tooltip: "Get query result for entity (mutable)",
        helpUrl: "",
        mode: "bevy",
        template: "{{QUERY}}.get_mut({{ENTITY}})",
        typeInfo: {
            inputs: {
                QUERY: ["Query"],
                ENTITY: ["Entity"]
            },
            output: ["QueryResult"]
        },
        validation: {
            required: ["QUERY", "ENTITY"]
        }
    },

    // ============================================================================
    // COMMANDS OPERATIONS
    // ============================================================================

    {
        type: "bevy_spawn",
        message0: "%1 .spawn( %2 )",
        args0: [
            { type: "input_value", name: "COMMANDS", check: "Commands" },
            { type: "input_value", name: "BUNDLE" }
        ],
        output: "EntityCommands",
        colour: 120,
        tooltip: "Spawn entity with bundle",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMMANDS}}.spawn({{BUNDLE}})",
        typeInfo: {
            inputs: {
                COMMANDS: ["Commands"],
                BUNDLE: ["Bundle", "Component"]
            },
            output: ["EntityCommands", "Entity"]
        },
        validation: {
            required: ["COMMANDS", "BUNDLE"]
        }
    },

    {
        type: "bevy_spawn_empty",
        message0: "%1 .spawn_empty()",
        args0: [
            { type: "input_value", name: "COMMANDS", check: "Commands" }
        ],
        output: "EntityCommands",
        colour: 120,
        tooltip: "Spawn empty entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMMANDS}}.spawn_empty()",
        typeInfo: {
            inputs: {
                COMMANDS: ["Commands"]
            },
            output: ["EntityCommands", "Entity"]
        },
        validation: {
            required: ["COMMANDS"]
        }
    },

    {
        type: "bevy_despawn",
        message0: "%1 .entity( %2 ).despawn()",
        args0: [
            { type: "input_value", name: "COMMANDS", check: "Commands" },
            { type: "input_value", name: "ENTITY", check: "Entity" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Despawn entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMMANDS}}.entity({{ENTITY}}).despawn();",
        typeInfo: {
            inputs: {
                COMMANDS: ["Commands"],
                ENTITY: ["Entity"]
            },
            output: null
        },
        validation: {
            required: ["COMMANDS", "ENTITY"]
        }
    },

    {
        type: "bevy_insert",
        message0: "%1 .entity( %2 ).insert( %3 )",
        args0: [
            { type: "input_value", name: "COMMANDS", check: "Commands" },
            { type: "input_value", name: "ENTITY", check: "Entity" },
            { type: "input_value", name: "COMPONENT" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Insert component to entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMMANDS}}.entity({{ENTITY}}).insert({{COMPONENT}});",
        typeInfo: {
            inputs: {
                COMMANDS: ["Commands"],
                ENTITY: ["Entity"],
                COMPONENT: ["Component", "Bundle"]
            },
            output: null
        },
        validation: {
            required: ["COMMANDS", "ENTITY", "COMPONENT"]
        }
    },

    {
        type: "bevy_remove",
        message0: "%1 .entity( %2 ).remove::< %3 >()",
        args0: [
            { type: "input_value", name: "COMMANDS", check: "Commands" },
            { type: "input_value", name: "ENTITY", check: "Entity" },
            { type: "field_input", name: "COMPONENT", text: "MyComponent" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Remove component from entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{COMMANDS}}.entity({{ENTITY}}).remove::<{{COMPONENT}}>();",
        typeInfo: {
            inputs: {
                COMMANDS: ["Commands"],
                ENTITY: ["Entity"]
            },
            output: null
        },
        validation: {
            required: ["COMMANDS", "ENTITY", "COMPONENT"],
            constraints: {
                COMPONENT: { pattern: /^[A-Z][a-zA-Z0-9]*$/ }
            }
        }
    },

    // ============================================================================
    // COMPONENT BUNDLES
    // ============================================================================

    {
        type: "bevy_transform_bundle",
        message0: "TransformBundle { %1 transform: %2 , %3 ..Default::default() %4 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TRANSFORM" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "Transform bundle",
        helpUrl: "",
        mode: "bevy",
        template: "TransformBundle { transform: {{TRANSFORM}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                TRANSFORM: ["Transform"]
            },
            output: ["Bundle"]
        },
        validation: {
            required: ["TRANSFORM"]
        }
    },

    {
        type: "bevy_pbr_bundle",
        message0: "PbrBundle { %1 mesh: %2 , %3 material: %4 , %5 transform: %6 , %7 ..Default::default() %8 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "MESH" },
            { type: "input_dummy" },
            { type: "input_value", name: "MATERIAL" },
            { type: "input_dummy" },
            { type: "input_value", name: "TRANSFORM" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "PBR bundle for 3D rendering",
        helpUrl: "",
        mode: "bevy",
        template: "PbrBundle { mesh: {{MESH}}, material: {{MATERIAL}}, transform: {{TRANSFORM}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                MESH: ["Handle"],
                MATERIAL: ["Handle"],
                TRANSFORM: ["Transform"]
            },
            output: ["Bundle"]
        },
        validation: {
            required: ["MESH", "MATERIAL", "TRANSFORM"]
        }
    },

    {
        type: "bevy_component_tuple",
        message0: "( %1 )",
        args0: [
            { type: "field_input", name: "COMPONENTS", text: "Transform::default(), Cell { mass: 1.0 }" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "Component tuple bundle",
        helpUrl: "",
        mode: "bevy",
        template: "({{COMPONENTS}})",
        typeInfo: {
            inputs: {},
            output: ["Bundle"]
        },
        validation: {
            required: ["COMPONENTS"]
        }
    },

    // ============================================================================
    // TRANSFORM OPERATIONS
    // ============================================================================

    {
        type: "bevy_transform_xyz",
        message0: "Transform::from_xyz( %1 , %2 , %3 )",
        args0: [
            { type: "input_value", name: "X", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "Y", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "Z", check: ["Number", "f32", "float"] }
        ],
        output: "Transform",
        colour: 120,
        tooltip: "Create transform from position",
        helpUrl: "",
        mode: "bevy",
        template: "Transform::from_xyz({{X}}, {{Y}}, {{Z}})",
        typeInfo: {
            inputs: {
                X: ["f32", "Number", "float"],
                Y: ["f32", "Number", "float"],
                Z: ["f32", "Number", "float"]
            },
            output: ["Transform"]
        },
        validation: {
            required: ["X", "Y", "Z"]
        }
    },

    {
        type: "bevy_transform_translation",
        message0: "Transform::from_translation( %1 )",
        args0: [
            { type: "input_value", name: "VEC3", check: ["Vec3", "vec3<f32>"] }
        ],
        output: "Transform",
        colour: 120,
        tooltip: "Create transform from Vec3",
        helpUrl: "",
        mode: "bevy",
        template: "Transform::from_translation({{VEC3}})",
        typeInfo: {
            inputs: {
                VEC3: ["Vec3", "vec3<f32>"]
            },
            output: ["Transform"]
        },
        validation: {
            required: ["VEC3"]
        }
    },

    {
        type: "bevy_transform_rotation",
        message0: "Transform::from_rotation( %1 )",
        args0: [
            { type: "input_value", name: "QUAT" }
        ],
        output: "Transform",
        colour: 120,
        tooltip: "Create transform from quaternion",
        helpUrl: "",
        mode: "bevy",
        template: "Transform::from_rotation({{QUAT}})",
        typeInfo: {
            inputs: {
                QUAT: ["Quat"]
            },
            output: ["Transform"]
        },
        validation: {
            required: ["QUAT"]
        }
    },

    {
        type: "bevy_transform_scale",
        message0: "Transform::from_scale( %1 )",
        args0: [
            { type: "input_value", name: "VEC3", check: ["Vec3", "vec3<f32>"] }
        ],
        output: "Transform",
        colour: 120,
        tooltip: "Create transform from scale",
        helpUrl: "",
        mode: "bevy",
        template: "Transform::from_scale({{VEC3}})",
        typeInfo: {
            inputs: {
                VEC3: ["Vec3", "vec3<f32>"]
            },
            output: ["Transform"]
        },
        validation: {
            required: ["VEC3"]
        }
    },

    // ============================================================================
    // TIME OPERATIONS
    // ============================================================================

    {
        type: "bevy_time_delta",
        message0: "%1 .delta_secs()",
        args0: [
            { type: "input_value", name: "TIME" }
        ],
        output: "Number",
        colour: 120,
        tooltip: "Get delta time in seconds",
        helpUrl: "",
        mode: "bevy",
        template: "{{TIME}}.delta_secs()",
        typeInfo: {
            inputs: {
                TIME: ["Time", "Res"]
            },
            output: ["f32", "Number"]
        },
        validation: {
            required: ["TIME"]
        }
    },

    {
        type: "bevy_time_elapsed",
        message0: "%1 .elapsed_secs()",
        args0: [
            { type: "input_value", name: "TIME" }
        ],
        output: "Number",
        colour: 120,
        tooltip: "Get elapsed time in seconds",
        helpUrl: "",
        mode: "bevy",
        template: "{{TIME}}.elapsed_secs()",
        typeInfo: {
            inputs: {
                TIME: ["Time", "Res"]
            },
            output: ["f32", "Number"]
        },
        validation: {
            required: ["TIME"]
        }
    },

    // ============================================================================
    // EVENT OPERATIONS
    // ============================================================================

    {
        type: "bevy_read_events",
        message0: "for %1 in %2 .read() %3 %4",
        args0: [
            { type: "field_input", name: "VAR", text: "event" },
            { type: "input_value", name: "READER", check: "EventReader" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Iterate over events",
        helpUrl: "",
        mode: "bevy",
        template: "for {{VAR}} in {{READER}}.read() {\n    {{BODY}}\n}",
        typeInfo: {
            inputs: {
                READER: ["EventReader"]
            },
            output: null
        },
        validation: {
            required: ["VAR", "READER"],
            constraints: {
                VAR: { pattern: /^[a-z][a-z0-9_]*$/ }
            }
        }
    },

    {
        type: "bevy_send_event",
        message0: "%1 .send( %2 )",
        args0: [
            { type: "input_value", name: "WRITER", check: "EventWriter" },
            { type: "input_value", name: "EVENT" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Send event",
        helpUrl: "",
        mode: "bevy",
        template: "{{WRITER}}.send({{EVENT}});",
        typeInfo: {
            inputs: {
                WRITER: ["EventWriter"],
                EVENT: ["Event"]
            },
            output: null
        },
        validation: {
            required: ["WRITER", "EVENT"]
        }
    },

    // ============================================================================
    // RESOURCE OPERATIONS
    // ============================================================================

    {
        type: "bevy_is_changed",
        message0: "%1 .is_changed()",
        args0: [
            { type: "input_value", name: "RESOURCE" }
        ],
        output: "Boolean",
        colour: 120,
        tooltip: "Check if resource changed",
        helpUrl: "",
        mode: "bevy",
        template: "{{RESOURCE}}.is_changed()",
        typeInfo: {
            inputs: {
                RESOURCE: ["Res", "ResMut", "Resource"]
            },
            output: ["bool", "Boolean"]
        },
        validation: {
            required: ["RESOURCE"]
        }
    },

    // ============================================================================
    // COMPONENT MARKERS
    // ============================================================================

    {
        type: "bevy_derive_component",
        message0: "#[derive(Component)] %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "STRUCT" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Derive Component trait",
        helpUrl: "",
        mode: "bevy",
        template: "#[derive(Component)]\n{{STRUCT}}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {}
    },

    {
        type: "bevy_derive_resource",
        message0: "#[derive(Resource)] %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "STRUCT" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Derive Resource trait",
        helpUrl: "",
        mode: "bevy",
        template: "#[derive(Resource)]\n{{STRUCT}}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {}
    },

    {
        type: "bevy_derive_event",
        message0: "#[derive(Event)] %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "STRUCT" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Derive Event trait",
        helpUrl: "",
        mode: "bevy",
        template: "#[derive(Event)]\n{{STRUCT}}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {}
    },

    // ============================================================================
    // SYSTEM CHAINING
    // ============================================================================

    {
        type: "bevy_system_tuple",
        message0: "( %1 )",
        args0: [
            { type: "field_input", name: "SYSTEMS", text: "system_a, system_b, system_c" }
        ],
        output: "SystemSet",
        colour: 120,
        tooltip: "Multiple systems tuple",
        helpUrl: "",
        mode: "bevy",
        template: "({{SYSTEMS}})",
        typeInfo: {
            inputs: {},
            output: ["SystemSet"]
        },
        validation: {
            required: ["SYSTEMS"]
        }
    },

    {
        type: "bevy_system_chain",
        message0: "%1 .chain()",
        args0: [
            { type: "input_value", name: "SYSTEMS" }
        ],
        output: "SystemSet",
        colour: 120,
        tooltip: "Chain systems to run in order",
        helpUrl: "",
        mode: "bevy",
        template: "{{SYSTEMS}}.chain()",
        typeInfo: {
            inputs: {
                SYSTEMS: ["SystemSet"]
            },
            output: ["SystemSet"]
        },
        validation: {
            required: ["SYSTEMS"]
        }
    },

    {
        type: "bevy_run_if",
        message0: "%1 .run_if( %2 )",
        args0: [
            { type: "input_value", name: "SYSTEM" },
            { type: "field_input", name: "CONDITION", text: "in_state(GameState::Playing)" }
        ],
        output: "System",
        colour: 120,
        tooltip: "Run system conditionally",
        helpUrl: "",
        mode: "bevy",
        template: "{{SYSTEM}}.run_if({{CONDITION}})",
        typeInfo: {
            inputs: {
                SYSTEM: ["System"]
            },
            output: ["System"]
        },
        validation: {
            required: ["SYSTEM", "CONDITION"]
        }
    },

    // ============================================================================
    // ENTITY TYPE
    // ============================================================================

    {
        type: "bevy_entity",
        message0: "Entity",
        output: "Entity",
        colour: 120,
        tooltip: "Entity type (cross-mode compatible with Biospheres)",
        helpUrl: "",
        mode: "bevy",
        template: "Entity",
        typeInfo: {
            inputs: {},
            output: ["Entity"]
        },
        validation: {}
    },

    // ============================================================================
    // CROSS-MODE REFERENCE BLOCKS
    // ============================================================================

    // Reference Node - Links to code in another file or mode
    {
        type: "bevy_reference_node",
        message0: "Reference 🔗 %1 Target File: %2 %3 Symbol: %4 %5 Description: %6",
        args0: [
            { type: "input_dummy" },
            { type: "field_input", name: "TARGET_FILE", text: "shader.wgsl" },
            { type: "input_dummy" },
            { type: "field_input", name: "TARGET_SYMBOL", text: "" },
            { type: "input_dummy" },
            { type: "field_input", name: "DESCRIPTION", text: "" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Create a reference to code in another file or mode. Used for cross-mode imports and dependencies.",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["TARGET_FILE"]
        }
    },

    // ============================================================================
    // VEC3 / VEC2 / QUAT CONSTRUCTORS
    // ============================================================================

    {
        type: "bevy_vec3_new",
        message0: "Vec3::new( %1 , %2 , %3 )",
        args0: [
            { type: "input_value", name: "X", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "Y", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "Z", check: ["Number", "f32", "float"] }
        ],
        output: "Vec3",
        colour: 120,
        tooltip: "Create a new Vec3",
        helpUrl: "",
        mode: "bevy",
        template: "Vec3::new({{X}}, {{Y}}, {{Z}})",
        typeInfo: {
            inputs: {
                X: ["f32", "Number", "float"],
                Y: ["f32", "Number", "float"],
                Z: ["f32", "Number", "float"]
            },
            output: ["Vec3"]
        },
        validation: {
            required: ["X", "Y", "Z"]
        }
    },

    {
        type: "bevy_vec3_const",
        message0: "Vec3:: %1",
        args0: [
            { type: "field_dropdown", name: "CONST", options: [
                ["ZERO", "ZERO"],
                ["ONE", "ONE"],
                ["X", "X"],
                ["Y", "Y"],
                ["Z", "Z"],
                ["NEG_X", "NEG_X"],
                ["NEG_Y", "NEG_Y"],
                ["NEG_Z", "NEG_Z"]
            ]}
        ],
        output: "Vec3",
        colour: 120,
        tooltip: "Vec3 constant",
        helpUrl: "",
        mode: "bevy",
        template: "Vec3::{{CONST}}",
        typeInfo: {
            inputs: {},
            output: ["Vec3"]
        },
        validation: {}
    },

    {
        type: "bevy_vec2_new",
        message0: "Vec2::new( %1 , %2 )",
        args0: [
            { type: "input_value", name: "X", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "Y", check: ["Number", "f32", "float"] }
        ],
        output: "Vec2",
        colour: 120,
        tooltip: "Create a new Vec2",
        helpUrl: "",
        mode: "bevy",
        template: "Vec2::new({{X}}, {{Y}})",
        typeInfo: {
            inputs: {
                X: ["f32", "Number", "float"],
                Y: ["f32", "Number", "float"]
            },
            output: ["Vec2"]
        },
        validation: {
            required: ["X", "Y"]
        }
    },

    {
        type: "bevy_quat_from_rotation",
        message0: "Quat::from_rotation_%1 ( %2 )",
        args0: [
            { type: "field_dropdown", name: "AXIS", options: [
                ["x", "x"],
                ["y", "y"],
                ["z", "z"]
            ]},
            { type: "input_value", name: "ANGLE", check: ["Number", "f32", "float"] }
        ],
        output: "Quat",
        colour: 120,
        tooltip: "Create quaternion from axis rotation",
        helpUrl: "",
        mode: "bevy",
        template: "Quat::from_rotation_{{AXIS}}({{ANGLE}})",
        typeInfo: {
            inputs: {
                ANGLE: ["f32", "Number", "float"]
            },
            output: ["Quat"]
        },
        validation: {
            required: ["ANGLE"]
        }
    },

    // ============================================================================
    // CAMERA BUNDLES
    // ============================================================================

    {
        type: "bevy_camera3d_bundle",
        message0: "Camera3dBundle { %1 transform: %2 , %3 ..Default::default() %4 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TRANSFORM" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "3D camera bundle",
        helpUrl: "",
        mode: "bevy",
        template: "Camera3dBundle { transform: {{TRANSFORM}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                TRANSFORM: ["Transform"]
            },
            output: ["Bundle"]
        },
        validation: {
            required: ["TRANSFORM"]
        }
    },

    {
        type: "bevy_camera2d_bundle",
        message0: "Camera2dBundle::default()",
        output: "Bundle",
        colour: 120,
        tooltip: "2D camera bundle",
        helpUrl: "",
        mode: "bevy",
        template: "Camera2dBundle::default()",
        typeInfo: {
            inputs: {},
            output: ["Bundle"]
        },
        validation: {}
    },

    // ============================================================================
    // LIGHT BUNDLES
    // ============================================================================

    {
        type: "bevy_point_light_bundle",
        message0: "PointLightBundle { %1 transform: %2 , %3 ..Default::default() %4 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TRANSFORM" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "Point light bundle",
        helpUrl: "",
        mode: "bevy",
        template: "PointLightBundle { transform: {{TRANSFORM}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                TRANSFORM: ["Transform"]
            },
            output: ["Bundle"]
        },
        validation: {
            required: ["TRANSFORM"]
        }
    },

    {
        type: "bevy_directional_light_bundle",
        message0: "DirectionalLightBundle { %1 transform: %2 , %3 ..Default::default() %4 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TRANSFORM" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "Directional light bundle",
        helpUrl: "",
        mode: "bevy",
        template: "DirectionalLightBundle { transform: {{TRANSFORM}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                TRANSFORM: ["Transform"]
            },
            output: ["Bundle"]
        },
        validation: {
            required: ["TRANSFORM"]
        }
    },

    // ============================================================================
    // MESH PRIMITIVES
    // ============================================================================

    {
        type: "bevy_mesh_primitive",
        message0: "meshes.add( %1 )",
        args0: [
            { type: "field_dropdown", name: "PRIMITIVE", options: [
                ["Cuboid::default()", "CUBOID"],
                ["Sphere::default()", "SPHERE"],
                ["Plane3d::default()", "PLANE"],
                ["Capsule3d::default()", "CAPSULE"],
                ["Cylinder::default()", "CYLINDER"],
                ["Torus::default()", "TORUS"]
            ]}
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create mesh primitive",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {},
            output: ["Handle"]
        },
        validation: {}
    },

    {
        type: "bevy_mesh_primitive_sized",
        message0: "meshes.add( %1 ( %2 ) )",
        args0: [
            { type: "field_dropdown", name: "PRIMITIVE", options: [
                ["Cuboid::new", "CUBOID"],
                ["Sphere::new", "SPHERE"],
                ["Capsule3d::new", "CAPSULE"],
                ["Cylinder::new", "CYLINDER"]
            ]},
            { type: "input_value", name: "SIZE", check: ["Number", "f32", "float"] }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create sized mesh primitive",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {
                SIZE: ["f32", "Number", "float"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["SIZE"]
        }
    },

    // ============================================================================
    // MATERIAL & COLOR
    // ============================================================================

    {
        type: "bevy_standard_material",
        message0: "materials.add( Color::srgb( %1 , %2 , %3 ) )",
        args0: [
            { type: "input_value", name: "R", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "G", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "B", check: ["Number", "f32", "float"] }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create standard material with RGB color",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(Color::srgb({{R}}, {{G}}, {{B}}))",
        typeInfo: {
            inputs: {
                R: ["f32", "Number", "float"],
                G: ["f32", "Number", "float"],
                B: ["f32", "Number", "float"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["R", "G", "B"]
        }
    },

    {
        type: "bevy_standard_material_full",
        message0: "materials.add( StandardMaterial { %1 base_color: %2 , %3 metallic: %4 , %5 perceptual_roughness: %6 , %7 ..Default::default() %8 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_value", name: "METALLIC", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_value", name: "ROUGHNESS", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create standard material with metallic and roughness",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { base_color: {{COLOR}}, metallic: {{METALLIC}}, perceptual_roughness: {{ROUGHNESS}}, ..Default::default() })",
        typeInfo: {
            inputs: {
                COLOR: ["Color"],
                METALLIC: ["f32", "Number", "float"],
                ROUGHNESS: ["f32", "Number", "float"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["COLOR", "METALLIC", "ROUGHNESS"]
        }
    },

    {
        type: "bevy_material_emissive",
        message0: "materials.add( StandardMaterial { %1 emissive: %2 , %3 ..Default::default() %4 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create emissive material (glowing)",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { emissive: {{COLOR}}.into(), ..Default::default() })",
        typeInfo: {
            inputs: {
                COLOR: ["Color"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["COLOR"]
        }
    },

    {
        type: "bevy_material_textured",
        message0: "materials.add( StandardMaterial { %1 base_color_texture: Some( %2 ), %3 ..Default::default() %4 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TEXTURE", check: "Handle" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create material with base color texture",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { base_color_texture: Some({{TEXTURE}}), ..Default::default() })",
        typeInfo: {
            inputs: {
                TEXTURE: ["Handle"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["TEXTURE"]
        }
    },

    {
        type: "bevy_material_normal_map",
        message0: "materials.add( StandardMaterial { %1 normal_map_texture: Some( %2 ), %3 ..Default::default() %4 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TEXTURE", check: "Handle" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create material with normal map",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { normal_map_texture: Some({{TEXTURE}}), ..Default::default() })",
        typeInfo: {
            inputs: {
                TEXTURE: ["Handle"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["TEXTURE"]
        }
    },

    {
        type: "bevy_material_alpha_mode",
        message0: "materials.add( StandardMaterial { %1 alpha_mode: AlphaMode:: %2 , %3 ..Default::default() %4 } )",
        args0: [
            { type: "input_dummy" },
            { type: "field_dropdown", name: "MODE", options: [
                ["Opaque", "Opaque"],
                ["Blend", "Blend"],
                ["Mask(0.5)", "Mask"],
                ["Add", "Add"],
                ["Multiply", "Multiply"]
            ]},
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create material with alpha blending mode",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {},
            output: ["Handle"]
        },
        validation: {}
    },

    {
        type: "bevy_material_unlit",
        message0: "materials.add( StandardMaterial { %1 base_color: %2 , %3 unlit: true, %4 ..Default::default() %5 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create unlit material (no lighting calculations)",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { base_color: {{COLOR}}, unlit: true, ..Default::default() })",
        typeInfo: {
            inputs: {
                COLOR: ["Color"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["COLOR"]
        }
    },

    {
        type: "bevy_material_double_sided",
        message0: "materials.add( StandardMaterial { %1 base_color: %2 , %3 double_sided: true, %4 ..Default::default() %5 } )",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Create double-sided material (renders both faces)",
        helpUrl: "",
        mode: "bevy",
        template: "materials.add(StandardMaterial { base_color: {{COLOR}}, double_sided: true, ..Default::default() })",
        typeInfo: {
            inputs: {
                COLOR: ["Color"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["COLOR"]
        }
    },

    {
        type: "bevy_color_const",
        message0: "Color:: %1",
        args0: [
            { type: "field_dropdown", name: "COLOR", options: [
                ["WHITE", "WHITE"],
                ["BLACK", "BLACK"],
                ["RED", "RED"],
                ["GREEN", "GREEN"],
                ["BLUE", "BLUE"],
                ["YELLOW", "YELLOW"],
                ["CYAN", "CYAN"],
                ["MAGENTA", "MAGENTA"]
            ]}
        ],
        output: "Color",
        colour: 120,
        tooltip: "Color constant",
        helpUrl: "",
        mode: "bevy",
        template: "Color::{{COLOR}}",
        typeInfo: {
            inputs: {},
            output: ["Color"]
        },
        validation: {}
    },

    {
        type: "bevy_color_srgb",
        message0: "Color::srgb( %1 , %2 , %3 )",
        args0: [
            { type: "input_value", name: "R", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "G", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "B", check: ["Number", "f32", "float"] }
        ],
        output: "Color",
        colour: 120,
        tooltip: "Create RGB color",
        helpUrl: "",
        mode: "bevy",
        template: "Color::srgb({{R}}, {{G}}, {{B}})",
        typeInfo: {
            inputs: {
                R: ["f32", "Number", "float"],
                G: ["f32", "Number", "float"],
                B: ["f32", "Number", "float"]
            },
            output: ["Color"]
        },
        validation: {
            required: ["R", "G", "B"]
        }
    },

    {
        type: "bevy_color_srgba",
        message0: "Color::srgba( %1 , %2 , %3 , %4 )",
        args0: [
            { type: "input_value", name: "R", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "G", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "B", check: ["Number", "f32", "float"] },
            { type: "input_value", name: "A", check: ["Number", "f32", "float"] }
        ],
        output: "Color",
        colour: 120,
        tooltip: "Create RGBA color with alpha",
        helpUrl: "",
        mode: "bevy",
        template: "Color::srgba({{R}}, {{G}}, {{B}}, {{A}})",
        typeInfo: {
            inputs: {
                R: ["f32", "Number", "float"],
                G: ["f32", "Number", "float"],
                B: ["f32", "Number", "float"],
                A: ["f32", "Number", "float"]
            },
            output: ["Color"]
        },
        validation: {
            required: ["R", "G", "B", "A"]
        }
    },

    // ============================================================================
    // ASSET LOADING
    // ============================================================================

    {
        type: "bevy_asset_server",
        message0: "Res< AssetServer >",
        output: "SystemParam",
        colour: 120,
        tooltip: "Asset server system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Res<AssetServer>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Res", "AssetServer"]
        },
        validation: {}
    },

    {
        type: "bevy_load_asset",
        message0: "%1 .load( %2 )",
        args0: [
            { type: "input_value", name: "ASSET_SERVER", check: "AssetServer" },
            { type: "field_input", name: "PATH", text: "models/scene.gltf" }
        ],
        output: "Handle",
        colour: 120,
        tooltip: "Load asset from file",
        helpUrl: "",
        mode: "bevy",
        template: "{{ASSET_SERVER}}.load(\"{{PATH}}\")",
        typeInfo: {
            inputs: {
                ASSET_SERVER: ["AssetServer", "Res"]
            },
            output: ["Handle"]
        },
        validation: {
            required: ["ASSET_SERVER", "PATH"]
        }
    },

    // ============================================================================
    // INPUT HANDLING
    // ============================================================================

    {
        type: "bevy_keyboard_input",
        message0: "Res< ButtonInput< KeyCode > >",
        output: "SystemParam",
        colour: 120,
        tooltip: "Keyboard input system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Res<ButtonInput<KeyCode>>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Res", "ButtonInput"]
        },
        validation: {}
    },

    {
        type: "bevy_key_pressed",
        message0: "%1 .pressed( KeyCode:: %2 )",
        args0: [
            { type: "input_value", name: "INPUT", check: "ButtonInput" },
            { type: "field_dropdown", name: "KEY", options: [
                ["W", "KeyW"],
                ["A", "KeyA"],
                ["S", "KeyS"],
                ["D", "KeyD"],
                ["Space", "Space"],
                ["Escape", "Escape"],
                ["Enter", "Enter"],
                ["ArrowUp", "ArrowUp"],
                ["ArrowDown", "ArrowDown"],
                ["ArrowLeft", "ArrowLeft"],
                ["ArrowRight", "ArrowRight"]
            ]}
        ],
        output: "Boolean",
        colour: 120,
        tooltip: "Check if key is pressed",
        helpUrl: "",
        mode: "bevy",
        template: "{{INPUT}}.pressed(KeyCode::{{KEY}})",
        typeInfo: {
            inputs: {
                INPUT: ["ButtonInput", "Res"]
            },
            output: ["bool", "Boolean"]
        },
        validation: {
            required: ["INPUT"]
        }
    },

    {
        type: "bevy_key_just_pressed",
        message0: "%1 .just_pressed( KeyCode:: %2 )",
        args0: [
            { type: "input_value", name: "INPUT", check: "ButtonInput" },
            { type: "field_dropdown", name: "KEY", options: [
                ["W", "KeyW"],
                ["A", "KeyA"],
                ["S", "KeyS"],
                ["D", "KeyD"],
                ["Space", "Space"],
                ["Escape", "Escape"],
                ["Enter", "Enter"]
            ]}
        ],
        output: "Boolean",
        colour: 120,
        tooltip: "Check if key was just pressed this frame",
        helpUrl: "",
        mode: "bevy",
        template: "{{INPUT}}.just_pressed(KeyCode::{{KEY}})",
        typeInfo: {
            inputs: {
                INPUT: ["ButtonInput", "Res"]
            },
            output: ["bool", "Boolean"]
        },
        validation: {
            required: ["INPUT"]
        }
    },

    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================

    {
        type: "bevy_state",
        message0: "Res< State< %1 > >",
        args0: [
            { type: "field_input", name: "TYPE", text: "GameState" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "State system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "Res<State<{{TYPE}}>>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "Res", "State"]
        },
        validation: {
            required: ["TYPE"]
        }
    },

    {
        type: "bevy_next_state",
        message0: "ResMut< NextState< %1 > >",
        args0: [
            { type: "field_input", name: "TYPE", text: "GameState" }
        ],
        output: "SystemParam",
        colour: 120,
        tooltip: "Next state system parameter",
        helpUrl: "",
        mode: "bevy",
        template: "ResMut<NextState<{{TYPE}}>>",
        typeInfo: {
            inputs: {},
            output: ["SystemParam", "ResMut", "NextState"]
        },
        validation: {
            required: ["TYPE"]
        }
    },

    {
        type: "bevy_set_state",
        message0: "%1 .set( %2 :: %3 )",
        args0: [
            { type: "input_value", name: "NEXT_STATE", check: "NextState" },
            { type: "field_input", name: "TYPE", text: "GameState" },
            { type: "field_input", name: "VARIANT", text: "Playing" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Set next state",
        helpUrl: "",
        mode: "bevy",
        template: "{{NEXT_STATE}}.set({{TYPE}}::{{VARIANT}});",
        typeInfo: {
            inputs: {
                NEXT_STATE: ["NextState", "ResMut"]
            },
            output: null
        },
        validation: {
            required: ["NEXT_STATE", "TYPE", "VARIANT"]
        }
    },

    {
        type: "bevy_in_state",
        message0: "in_state( %1 :: %2 )",
        args0: [
            { type: "field_input", name: "TYPE", text: "GameState" },
            { type: "field_input", name: "VARIANT", text: "Playing" }
        ],
        output: "Condition",
        colour: 120,
        tooltip: "State condition for run_if",
        helpUrl: "",
        mode: "bevy",
        template: "in_state({{TYPE}}::{{VARIANT}})",
        typeInfo: {
            inputs: {},
            output: ["Condition"]
        },
        validation: {
            required: ["TYPE", "VARIANT"]
        }
    },

    {
        type: "bevy_on_enter",
        message0: "OnEnter( %1 :: %2 )",
        args0: [
            { type: "field_input", name: "TYPE", text: "GameState" },
            { type: "field_input", name: "VARIANT", text: "Playing" }
        ],
        output: "Schedule",
        colour: 120,
        tooltip: "Schedule that runs when entering a state",
        helpUrl: "",
        mode: "bevy",
        template: "OnEnter({{TYPE}}::{{VARIANT}})",
        typeInfo: {
            inputs: {},
            output: ["Schedule"]
        },
        validation: {
            required: ["TYPE", "VARIANT"]
        }
    },

    {
        type: "bevy_on_exit",
        message0: "OnExit( %1 :: %2 )",
        args0: [
            { type: "field_input", name: "TYPE", text: "GameState" },
            { type: "field_input", name: "VARIANT", text: "Playing" }
        ],
        output: "Schedule",
        colour: 120,
        tooltip: "Schedule that runs when exiting a state",
        helpUrl: "",
        mode: "bevy",
        template: "OnExit({{TYPE}}::{{VARIANT}})",
        typeInfo: {
            inputs: {},
            output: ["Schedule"]
        },
        validation: {
            required: ["TYPE", "VARIANT"]
        }
    },

    // ============================================================================
    // APP RUNNER
    // ============================================================================

    {
        type: "bevy_app_new",
        message0: "App::new()",
        output: "App",
        colour: 120,
        tooltip: "Create new Bevy app",
        helpUrl: "",
        mode: "bevy",
        template: "App::new()",
        typeInfo: {
            inputs: {},
            output: ["App"]
        },
        validation: {}
    },

    {
        type: "bevy_app_run",
        message0: "%1 .run()",
        args0: [
            { type: "input_value", name: "APP", check: "App" }
        ],
        previousStatement: null,
        colour: 120,
        tooltip: "Run the Bevy app",
        helpUrl: "",
        mode: "bevy",
        template: "{{APP}}.run();",
        typeInfo: {
            inputs: {
                APP: ["App"]
            },
            output: null
        },
        validation: {
            required: ["APP"]
        }
    },

    // ============================================================================
    // COMMON PLUGINS
    // ============================================================================

    {
        type: "bevy_default_plugins",
        message0: "DefaultPlugins",
        output: "Plugin",
        colour: 120,
        tooltip: "Default Bevy plugins",
        helpUrl: "",
        mode: "bevy",
        template: "DefaultPlugins",
        typeInfo: {
            inputs: {},
            output: ["Plugin"]
        },
        validation: {}
    },

    {
        type: "bevy_minimal_plugins",
        message0: "MinimalPlugins",
        output: "Plugin",
        colour: 120,
        tooltip: "Minimal Bevy plugins",
        helpUrl: "",
        mode: "bevy",
        template: "MinimalPlugins",
        typeInfo: {
            inputs: {},
            output: ["Plugin"]
        },
        validation: {}
    },

    // ============================================================================
    // HIERARCHY
    // ============================================================================

    {
        type: "bevy_with_children",
        message0: "%1 .with_children( |parent| %2 %3 )",
        args0: [
            { type: "input_value", name: "ENTITY_COMMANDS", check: "EntityCommands" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        output: "EntityCommands",
        colour: 120,
        tooltip: "Add children to entity",
        helpUrl: "",
        mode: "bevy",
        template: "{{ENTITY_COMMANDS}}.with_children(|parent| {\n    {{BODY}}\n})",
        typeInfo: {
            inputs: {
                ENTITY_COMMANDS: ["EntityCommands"]
            },
            output: ["EntityCommands"]
        },
        validation: {
            required: ["ENTITY_COMMANDS"]
        }
    },

    {
        type: "bevy_parent_spawn",
        message0: "parent.spawn( %1 )",
        args0: [
            { type: "input_value", name: "BUNDLE" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Spawn child entity",
        helpUrl: "",
        mode: "bevy",
        template: "parent.spawn({{BUNDLE}});",
        typeInfo: {
            inputs: {
                BUNDLE: ["Bundle", "Component"]
            },
            output: null
        },
        validation: {
            required: ["BUNDLE"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - FOG
    // ============================================================================

    {
        type: "bevy_fog_settings",
        message0: "FogSettings { %1 color: %2 , %3 falloff: %4 %5 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "field_dropdown", name: "FALLOFF", options: [
                ["Linear", "LINEAR"],
                ["Exponential", "EXPONENTIAL"],
                ["ExponentialSquared", "EXPONENTIAL_SQUARED"],
                ["Atmospheric", "ATMOSPHERIC"]
            ]},
            { type: "input_value", name: "FALLOFF_PARAMS" }
        ],
        output: "Component",
        colour: 120,
        tooltip: "Fog settings component",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {
                COLOR: ["Color"],
                FALLOFF_PARAMS: ["FogFalloff"]
            },
            output: ["Component", "FogSettings"]
        },
        validation: {
            required: ["COLOR"]
        }
    },

    {
        type: "bevy_fog_falloff_linear",
        message0: "FogFalloff::Linear { %1 start: %2 , %3 end: %4 %5 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "START", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_value", name: "END", check: ["Number", "f32", "float"] },
            { type: "input_dummy" }
        ],
        output: "FogFalloff",
        colour: 120,
        tooltip: "Linear fog falloff",
        helpUrl: "",
        mode: "bevy",
        template: "FogFalloff::Linear { start: {{START}}, end: {{END}} }",
        typeInfo: {
            inputs: {
                START: ["f32", "Number", "float"],
                END: ["f32", "Number", "float"]
            },
            output: ["FogFalloff"]
        },
        validation: {
            required: ["START", "END"]
        }
    },

    {
        type: "bevy_fog_falloff_exponential",
        message0: "FogFalloff::Exponential { %1 density: %2 %3 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "DENSITY", check: ["Number", "f32", "float"] },
            { type: "input_dummy" }
        ],
        output: "FogFalloff",
        colour: 120,
        tooltip: "Exponential fog falloff",
        helpUrl: "",
        mode: "bevy",
        template: "FogFalloff::Exponential { density: {{DENSITY}} }",
        typeInfo: {
            inputs: {
                DENSITY: ["f32", "Number", "float"]
            },
            output: ["FogFalloff"]
        },
        validation: {
            required: ["DENSITY"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - AMBIENT LIGHT
    // ============================================================================

    {
        type: "bevy_ambient_light",
        message0: "AmbientLight { %1 color: %2 , %3 brightness: %4 %5 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_value", name: "BRIGHTNESS", check: ["Number", "f32", "float"] },
            { type: "input_dummy" }
        ],
        output: "Resource",
        colour: 120,
        tooltip: "Ambient light resource",
        helpUrl: "",
        mode: "bevy",
        template: "AmbientLight { color: {{COLOR}}, brightness: {{BRIGHTNESS}} }",
        typeInfo: {
            inputs: {
                COLOR: ["Color"],
                BRIGHTNESS: ["f32", "Number", "float"]
            },
            output: ["Resource", "AmbientLight"]
        },
        validation: {
            required: ["COLOR", "BRIGHTNESS"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - SHADOWS
    // ============================================================================

    {
        type: "bevy_cascaded_shadow_config",
        message0: "CascadeShadowConfig { %1 num_cascades: %2 %3 }",
        args0: [
            { type: "input_dummy" },
            { type: "field_number", name: "NUM_CASCADES", value: 4, min: 1, max: 8 },
            { type: "input_dummy" }
        ],
        output: "Component",
        colour: 120,
        tooltip: "Cascade shadow configuration",
        helpUrl: "",
        mode: "bevy",
        template: "CascadeShadowConfig { num_cascades: {{NUM_CASCADES}}, ..Default::default() }",
        typeInfo: {
            inputs: {},
            output: ["Component", "CascadeShadowConfig"]
        },
        validation: {}
    },

    {
        type: "bevy_shadow_settings",
        message0: "shadows_enabled: %1",
        args0: [
            { type: "field_checkbox", name: "ENABLED", checked: true }
        ],
        output: "Setting",
        colour: 120,
        tooltip: "Enable/disable shadows",
        helpUrl: "",
        mode: "bevy",
        typeInfo: {
            inputs: {},
            output: ["Setting"]
        },
        validation: {}
    },

    // ============================================================================
    // RENDERING MODULES - SKYBOX
    // ============================================================================

    {
        type: "bevy_skybox",
        message0: "Skybox { %1 image: %2 , %3 brightness: %4 %5 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "IMAGE", check: "Handle" },
            { type: "input_dummy" },
            { type: "input_value", name: "BRIGHTNESS", check: ["Number", "f32", "float"] },
            { type: "input_dummy" }
        ],
        output: "Component",
        colour: 120,
        tooltip: "Skybox component",
        helpUrl: "",
        mode: "bevy",
        template: "Skybox { image: {{IMAGE}}, brightness: {{BRIGHTNESS}} }",
        typeInfo: {
            inputs: {
                IMAGE: ["Handle"],
                BRIGHTNESS: ["f32", "Number", "float"]
            },
            output: ["Component", "Skybox"]
        },
        validation: {
            required: ["IMAGE", "BRIGHTNESS"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - BLOOM
    // ============================================================================

    {
        type: "bevy_bloom_settings",
        message0: "BloomSettings { %1 intensity: %2 %3 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "INTENSITY", check: ["Number", "f32", "float"] },
            { type: "input_dummy" }
        ],
        output: "Component",
        colour: 120,
        tooltip: "Bloom post-processing effect",
        helpUrl: "",
        mode: "bevy",
        template: "BloomSettings { intensity: {{INTENSITY}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                INTENSITY: ["f32", "Number", "float"]
            },
            output: ["Component", "BloomSettings"]
        },
        validation: {
            required: ["INTENSITY"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - TONEMAPPING
    // ============================================================================

    {
        type: "bevy_tonemapping",
        message0: "Tonemapping:: %1",
        args0: [
            { type: "field_dropdown", name: "METHOD", options: [
                ["None", "None"],
                ["Reinhard", "Reinhard"],
                ["ReinhardLuminance", "ReinhardLuminance"],
                ["AcesFitted", "AcesFitted"],
                ["AgX", "AgX"],
                ["SomewhatBoringDisplayTransform", "SomewhatBoringDisplayTransform"],
                ["TonyMcMapface", "TonyMcMapface"],
                ["BlenderFilmic", "BlenderFilmic"]
            ]}
        ],
        output: "Component",
        colour: 120,
        tooltip: "Tonemapping method",
        helpUrl: "",
        mode: "bevy",
        template: "Tonemapping::{{METHOD}}",
        typeInfo: {
            inputs: {},
            output: ["Component", "Tonemapping"]
        },
        validation: {}
    },

    // ============================================================================
    // RENDERING MODULES - MSAA
    // ============================================================================

    {
        type: "bevy_msaa",
        message0: "Msaa:: %1",
        args0: [
            { type: "field_dropdown", name: "SAMPLES", options: [
                ["Off", "Off"],
                ["Sample2", "Sample2"],
                ["Sample4", "Sample4"],
                ["Sample8", "Sample8"]
            ]}
        ],
        output: "Resource",
        colour: 120,
        tooltip: "Multi-sample anti-aliasing",
        helpUrl: "",
        mode: "bevy",
        template: "Msaa::{{SAMPLES}}",
        typeInfo: {
            inputs: {},
            output: ["Resource", "Msaa"]
        },
        validation: {}
    },

    // ============================================================================
    // RENDERING MODULES - CLEAR COLOR
    // ============================================================================

    {
        type: "bevy_clear_color",
        message0: "ClearColor( %1 )",
        args0: [
            { type: "input_value", name: "COLOR", check: "Color" }
        ],
        output: "Resource",
        colour: 120,
        tooltip: "Background clear color",
        helpUrl: "",
        mode: "bevy",
        template: "ClearColor({{COLOR}})",
        typeInfo: {
            inputs: {
                COLOR: ["Color"]
            },
            output: ["Resource", "ClearColor"]
        },
        validation: {
            required: ["COLOR"]
        }
    },

    // ============================================================================
    // RENDERING MODULES - VISIBILITY
    // ============================================================================

    {
        type: "bevy_visibility",
        message0: "Visibility:: %1",
        args0: [
            { type: "field_dropdown", name: "STATE", options: [
                ["Visible", "Visible"],
                ["Hidden", "Hidden"],
                ["Inherited", "Inherited"]
            ]}
        ],
        output: "Component",
        colour: 120,
        tooltip: "Visibility component",
        helpUrl: "",
        mode: "bevy",
        template: "Visibility::{{STATE}}",
        typeInfo: {
            inputs: {},
            output: ["Component", "Visibility"]
        },
        validation: {}
    },

    // ============================================================================
    // RENDERING MODULES - WIREFRAME
    // ============================================================================

    {
        type: "bevy_wireframe",
        message0: "Wireframe",
        output: "Component",
        colour: 120,
        tooltip: "Wireframe rendering component",
        helpUrl: "",
        mode: "bevy",
        template: "Wireframe",
        typeInfo: {
            inputs: {},
            output: ["Component", "Wireframe"]
        },
        validation: {}
    },

    {
        type: "bevy_no_wireframe",
        message0: "NoWireframe",
        output: "Component",
        colour: 120,
        tooltip: "Disable wireframe rendering",
        helpUrl: "",
        mode: "bevy",
        template: "NoWireframe",
        typeInfo: {
            inputs: {},
            output: ["Component", "NoWireframe"]
        },
        validation: {}
    },

    // ============================================================================
    // PHYSICS MODULES - VELOCITY
    // ============================================================================

    {
        type: "bevy_velocity",
        message0: "Velocity { %1 linvel: %2 , %3 angvel: %4 %5 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "LINEAR", check: "Vec3" },
            { type: "input_dummy" },
            { type: "input_value", name: "ANGULAR", check: "Vec3" },
            { type: "input_dummy" }
        ],
        output: "Component",
        colour: 120,
        tooltip: "Velocity component (linear and angular)",
        helpUrl: "",
        mode: "bevy",
        template: "Velocity { linvel: {{LINEAR}}, angvel: {{ANGULAR}} }",
        typeInfo: {
            inputs: {
                LINEAR: ["Vec3"],
                ANGULAR: ["Vec3"]
            },
            output: ["Component", "Velocity"]
        },
        validation: {
            required: ["LINEAR", "ANGULAR"]
        }
    },

    // ============================================================================
    // UI MODULES - TEXT
    // ============================================================================

    {
        type: "bevy_text_bundle",
        message0: "TextBundle { %1 text: %2 , %3 style: %4 , %5 ..Default::default() %6 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "TEXT" },
            { type: "input_dummy" },
            { type: "input_value", name: "STYLE" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "Text UI bundle",
        helpUrl: "",
        mode: "bevy",
        template: "TextBundle { text: {{TEXT}}, style: {{STYLE}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                TEXT: ["Text"],
                STYLE: ["Style"]
            },
            output: ["Bundle", "TextBundle"]
        },
        validation: {
            required: ["TEXT"]
        }
    },

    {
        type: "bevy_text",
        message0: "Text::from_section( %1 , %2 )",
        args0: [
            { type: "field_input", name: "CONTENT", text: "Hello, Bevy!" },
            { type: "input_value", name: "STYLE" }
        ],
        output: "Text",
        colour: 120,
        tooltip: "Create text from section",
        helpUrl: "",
        mode: "bevy",
        template: "Text::from_section(\"{{CONTENT}}\", {{STYLE}})",
        typeInfo: {
            inputs: {
                STYLE: ["TextStyle"]
            },
            output: ["Text"]
        },
        validation: {
            required: ["CONTENT"]
        }
    },

    {
        type: "bevy_text_style",
        message0: "TextStyle { %1 font_size: %2 , %3 color: %4 , %5 ..Default::default() %6 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "SIZE", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "TextStyle",
        colour: 120,
        tooltip: "Text style configuration",
        helpUrl: "",
        mode: "bevy",
        template: "TextStyle { font_size: {{SIZE}}, color: {{COLOR}}, ..Default::default() }",
        typeInfo: {
            inputs: {
                SIZE: ["f32", "Number", "float"],
                COLOR: ["Color"]
            },
            output: ["TextStyle"]
        },
        validation: {
            required: ["SIZE", "COLOR"]
        }
    },

    // ============================================================================
    // UI MODULES - NODE
    // ============================================================================

    {
        type: "bevy_node_bundle",
        message0: "NodeBundle { %1 style: %2 , %3 background_color: %4 , %5 ..Default::default() %6 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "STYLE" },
            { type: "input_dummy" },
            { type: "input_value", name: "COLOR", check: "Color" },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Bundle",
        colour: 120,
        tooltip: "UI node bundle",
        helpUrl: "",
        mode: "bevy",
        template: "NodeBundle { style: {{STYLE}}, background_color: {{COLOR}}.into(), ..Default::default() }",
        typeInfo: {
            inputs: {
                STYLE: ["Style"],
                COLOR: ["Color"]
            },
            output: ["Bundle", "NodeBundle"]
        },
        validation: {}
    },

    {
        type: "bevy_ui_style",
        message0: "Style { %1 width: Val::Px( %2 ), %3 height: Val::Px( %4 ), %5 ..Default::default() %6 }",
        args0: [
            { type: "input_dummy" },
            { type: "input_value", name: "WIDTH", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_value", name: "HEIGHT", check: ["Number", "f32", "float"] },
            { type: "input_dummy" },
            { type: "input_dummy" }
        ],
        output: "Style",
        colour: 120,
        tooltip: "UI style configuration",
        helpUrl: "",
        mode: "bevy",
        template: "Style { width: Val::Px({{WIDTH}}), height: Val::Px({{HEIGHT}}), ..Default::default() }",
        typeInfo: {
            inputs: {
                WIDTH: ["f32", "Number", "float"],
                HEIGHT: ["f32", "Number", "float"]
            },
            output: ["Style"]
        },
        validation: {
            required: ["WIDTH", "HEIGHT"]
        }
    },

    // ============================================================================
    // FILE & MODULE ORGANIZATION
    // ============================================================================

    {
        type: "bevy_mod",
        message0: "mod %1 %2 %3",
        args0: [
            { type: "field_input", name: "NAME", text: "my_module" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Define a module",
        helpUrl: "",
        mode: "bevy",
        template: "mod {{NAME}} {\n{{BODY}}\n}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["NAME"]
        }
    },

    {
        type: "bevy_mod_file",
        message0: "🔗 mod %1;",
        args0: [
            { type: "field_input", name: "NAME", text: "my_module" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Link to another file (e.g., 'mod utils;' links to utils.rs)",
        helpUrl: "",
        mode: "bevy",
        template: "mod {{NAME}};",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["NAME"]
        }
    },

    {
        type: "bevy_use",
        message0: "use %1",
        args0: [
            { type: "field_input", name: "PATH", text: "bevy::prelude::*" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Import items into scope",
        helpUrl: "",
        mode: "bevy",
        template: "use {{PATH}};",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["PATH"]
        }
    },

    {
        type: "bevy_pub_use",
        message0: "pub use %1",
        args0: [
            { type: "field_input", name: "PATH", text: "bevy::prelude::*" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Re-export items",
        helpUrl: "",
        mode: "bevy",
        template: "pub use {{PATH}};",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["PATH"]
        }
    },

    {
        type: "bevy_pub_mod",
        message0: "pub mod %1 %2 %3",
        args0: [
            { type: "field_input", name: "NAME", text: "my_module" },
            { type: "input_dummy" },
            { type: "input_statement", name: "BODY" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Define a public module",
        helpUrl: "",
        mode: "bevy",
        template: "pub mod {{NAME}} {\n{{BODY}}\n}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {
            required: ["NAME"]
        }
    },

    {
        type: "bevy_comment",
        message0: "// %1",
        args0: [
            { type: "field_input", name: "TEXT", text: "comment" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 120,
        tooltip: "Single-line comment",
        helpUrl: "",
        mode: "bevy",
        template: "// {{TEXT}}",
        typeInfo: {
            inputs: {},
            output: null
        },
        validation: {}
    }
]);
