// Bevy Toolbox Definition
// Consolidated toolbox for Bevy mode
// Requirements: 1.3, 4.4, 9.1, 9.2, 10.4

const BevyToolbox = {
    mode: "bevy",
    displayName: "Bevy",
    color: "#4EC9B0",
    
    // Toolbox structure
    getToolbox: function() {
        return {
            kind: "categoryToolbox",
            contents: [
                // File Organization
                {
                    kind: "category",
                    name: "Files",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "file_container" },
                        { kind: "label", text: "Link Files" },
                        { kind: "block", type: "bevy_mod_file" },
                        { kind: "label", text: "Modules" },
                        { kind: "block", type: "bevy_mod" },
                        { kind: "block", type: "bevy_pub_mod" },
                        { kind: "label", text: "Imports" },
                        { kind: "block", type: "bevy_use" },
                        { kind: "block", type: "bevy_pub_use" },
                        { kind: "label", text: "Comments" },
                        { kind: "block", type: "bevy_comment" }
                    ]
                },
                
                // Game Development (Scratch-like)
                {
                    kind: "category",
                    name: "🎮 Game Blocks",
                    colour: 210,
                    contents: [
                        {
                            kind: "category",
                            name: "Movement",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_move_forward" },
                                { kind: "block", type: "game_move_to" },
                                { kind: "block", type: "game_glide_to" },
                                { kind: "block", type: "game_turn_degrees" },
                                { kind: "block", type: "game_point_direction" },
                                { kind: "block", type: "game_point_towards" },
                                { kind: "block", type: "game_change_position" },
                                { kind: "block", type: "game_set_velocity" },
                                { kind: "label", text: "Advanced" },
                                { kind: "block", type: "game_dash" },
                                { kind: "block", type: "game_jump" },
                                { kind: "block", type: "game_double_jump" },
                                { kind: "block", type: "game_wall_jump" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Position",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_position_x" },
                                { kind: "block", type: "game_position_y" },
                                { kind: "block", type: "game_position_z" },
                                { kind: "block", type: "game_direction" },
                                { kind: "block", type: "game_distance_to" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Input",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_key_pressed" },
                                { kind: "block", type: "game_key_just_pressed" },
                                { kind: "block", type: "game_mouse_button_pressed" },
                                { kind: "block", type: "game_mouse_position" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Collision",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_touching" },
                                { kind: "block", type: "game_on_collision" },
                                { kind: "block", type: "game_is_grounded" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Health & Damage",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_health" },
                                { kind: "block", type: "game_max_health" },
                                { kind: "block", type: "game_take_damage" },
                                { kind: "block", type: "game_heal" },
                                { kind: "block", type: "game_set_health" },
                                { kind: "block", type: "game_is_dead" },
                                { kind: "block", type: "game_invincible" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Game State",
                            colour: 210,
                            contents: [
                                { kind: "label", text: "Score & Lives" },
                                { kind: "block", type: "game_score" },
                                { kind: "block", type: "game_change_score" },
                                { kind: "block", type: "game_set_score" },
                                { kind: "block", type: "game_lives" },
                                { kind: "block", type: "game_change_lives" },
                                { kind: "label", text: "Timer" },
                                { kind: "block", type: "game_timer" },
                                { kind: "block", type: "game_reset_timer" },
                                { kind: "label", text: "Levels" },
                                { kind: "block", type: "game_load_level" },
                                { kind: "block", type: "game_next_level" },
                                { kind: "block", type: "game_restart_level" },
                                { kind: "label", text: "Pause" },
                                { kind: "block", type: "game_pause" },
                                { kind: "block", type: "game_resume" },
                                { kind: "block", type: "game_is_paused" },
                                { kind: "label", text: "End States" },
                                { kind: "block", type: "game_game_over" },
                                { kind: "block", type: "game_win" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Appearance",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_show" },
                                { kind: "block", type: "game_hide" },
                                { kind: "block", type: "game_set_color" },
                                { kind: "block", type: "game_set_size" },
                                { kind: "block", type: "game_change_size" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Animation",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_animate_property" },
                                { kind: "block", type: "game_play_animation" },
                                { kind: "block", type: "game_stop_animation" },
                                { kind: "block", type: "game_animation_speed" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Camera",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_camera_follow" },
                                { kind: "block", type: "game_camera_shake" },
                                { kind: "block", type: "game_camera_zoom" },
                                { kind: "block", type: "game_camera_bounds" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Particles & Effects",
                            colour: 210,
                            contents: [
                                { kind: "label", text: "Particles" },
                                { kind: "block", type: "game_spawn_particles" },
                                { kind: "block", type: "game_particle_trail" },
                                { kind: "label", text: "Screen Effects" },
                                { kind: "block", type: "game_screen_flash" },
                                { kind: "block", type: "game_slow_motion" },
                                { kind: "block", type: "game_freeze_frame" },
                                { kind: "block", type: "game_pulse_size" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Sound",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_play_sound" },
                                { kind: "block", type: "game_play_sound_until_done" },
                                { kind: "block", type: "game_stop_all_sounds" },
                                { kind: "block", type: "game_set_volume" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Physics",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_apply_force" },
                                { kind: "block", type: "game_apply_impulse" },
                                { kind: "block", type: "game_set_gravity" },
                                { kind: "block", type: "game_bounce" },
                                { kind: "block", type: "game_friction" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "AI & Behavior",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_move_towards" },
                                { kind: "block", type: "game_follow_entity" },
                                { kind: "block", type: "game_flee_from" },
                                { kind: "block", type: "game_patrol" },
                                { kind: "block", type: "game_wander" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Spawning",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_spawn_entity" },
                                { kind: "block", type: "game_spawn_wave" },
                                { kind: "block", type: "game_spawn_at_random" },
                                { kind: "block", type: "game_destroy_self" },
                                { kind: "block", type: "game_destroy_entity" },
                                { kind: "block", type: "game_count_entities" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Inventory",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_add_item" },
                                { kind: "block", type: "game_remove_item" },
                                { kind: "block", type: "game_has_item" },
                                { kind: "block", type: "game_item_count" },
                                { kind: "block", type: "game_clear_inventory" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "UI & HUD",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_show_text" },
                                { kind: "block", type: "game_show_notification" },
                                { kind: "block", type: "game_update_hud" },
                                { kind: "block", type: "game_show_healthbar" },
                                { kind: "block", type: "game_hide_healthbar" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Random & Math",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_random_range" },
                                { kind: "block", type: "game_random_chance" },
                                { kind: "block", type: "game_pick_random" }
                            ]
                        },
                        {
                            kind: "category",
                            name: "Control",
                            colour: 210,
                            contents: [
                                { kind: "block", type: "game_when_game_starts" },
                                { kind: "block", type: "game_every_frame" },
                                { kind: "block", type: "game_wait_seconds" },
                                { kind: "block", type: "game_repeat_forever" }
                            ]
                        }
                    ]
                },
                
                // App & Plugins
                {
                    kind: "category",
                    name: "App & Plugins",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "App Setup" },
                        { kind: "block", type: "bevy_app_new" },
                        { kind: "block", type: "bevy_app_run" },
                        { kind: "block", type: "bevy_default_plugins" },
                        { kind: "block", type: "bevy_minimal_plugins" },
                        { kind: "label", text: "Plugin Definition" },
                        { kind: "block", type: "bevy_plugin" },
                        { kind: "block", type: "bevy_plugin_impl" },
                        { kind: "label", text: "App Configuration" },
                        { kind: "block", type: "bevy_add_systems" },
                        { kind: "block", type: "bevy_add_plugins" },
                        { kind: "block", type: "bevy_init_resource" },
                        { kind: "block", type: "bevy_insert_resource" },
                        { kind: "block", type: "bevy_add_event" }
                    ]
                },
                
                // Systems
                {
                    kind: "category",
                    name: "Systems",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_system" },
                        { kind: "block", type: "bevy_system_tuple" },
                        { kind: "block", type: "bevy_system_chain" },
                        { kind: "block", type: "bevy_run_if" }
                    ]
                },
                
                // System Parameters
                {
                    kind: "category",
                    name: "System Parameters",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Queries" },
                        { kind: "block", type: "bevy_query" },
                        { kind: "block", type: "bevy_query_components" },
                        { kind: "block", type: "bevy_query_filter" },
                        { kind: "label", text: "Resources" },
                        { kind: "block", type: "bevy_res" },
                        { kind: "block", type: "bevy_res_mut" },
                        { kind: "block", type: "bevy_time" },
                        { kind: "block", type: "bevy_assets" },
                        { kind: "block", type: "bevy_asset_server" },
                        { kind: "label", text: "Commands & Events" },
                        { kind: "block", type: "bevy_commands" },
                        { kind: "block", type: "bevy_event_reader" },
                        { kind: "block", type: "bevy_event_writer" },
                        { kind: "block", type: "bevy_local" },
                        { kind: "label", text: "Input" },
                        { kind: "block", type: "bevy_keyboard_input" },
                        { kind: "label", text: "State" },
                        { kind: "block", type: "bevy_state" },
                        { kind: "block", type: "bevy_next_state" }
                    ]
                },
                
                // Query Operations
                {
                    kind: "category",
                    name: "Query Operations",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_query_iter" },
                        { kind: "block", type: "bevy_query_iter_mut" },
                        { kind: "block", type: "bevy_query_single" },
                        { kind: "block", type: "bevy_query_single_mut" },
                        { kind: "block", type: "bevy_query_get" },
                        { kind: "block", type: "bevy_query_get_mut" }
                    ]
                },
                
                // Commands
                {
                    kind: "category",
                    name: "Commands",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Entity Management" },
                        { kind: "block", type: "bevy_spawn" },
                        { kind: "block", type: "bevy_spawn_empty" },
                        { kind: "block", type: "bevy_despawn" },
                        { kind: "label", text: "Component Management" },
                        { kind: "block", type: "bevy_insert" },
                        { kind: "block", type: "bevy_remove" },
                        { kind: "label", text: "Hierarchy" },
                        { kind: "block", type: "bevy_with_children" },
                        { kind: "block", type: "bevy_parent_spawn" }
                    ]
                },
                
                // Bundles & Components
                {
                    kind: "category",
                    name: "Bundles & Components",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Common Bundles" },
                        { kind: "block", type: "bevy_transform_bundle" },
                        { kind: "block", type: "bevy_pbr_bundle" },
                        { kind: "block", type: "bevy_component_tuple" },
                        { kind: "label", text: "Camera" },
                        { kind: "block", type: "bevy_camera3d_bundle" },
                        { kind: "block", type: "bevy_camera2d_bundle" },
                        { kind: "label", text: "Lights" },
                        { kind: "block", type: "bevy_point_light_bundle" },
                        { kind: "block", type: "bevy_directional_light_bundle" },
                        { kind: "label", text: "Derives" },
                        { kind: "block", type: "bevy_derive_component" },
                        { kind: "block", type: "bevy_derive_resource" },
                        { kind: "block", type: "bevy_derive_event" }
                    ]
                },
                
                // Math & Vectors
                {
                    kind: "category",
                    name: "Math & Vectors",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Vec3" },
                        { kind: "block", type: "bevy_vec3_new" },
                        { kind: "block", type: "bevy_vec3_const" },
                        { kind: "label", text: "Vec2" },
                        { kind: "block", type: "bevy_vec2_new" },
                        { kind: "label", text: "Quaternion" },
                        { kind: "block", type: "bevy_quat_from_rotation" },
                        { kind: "label", text: "Transform" },
                        { kind: "block", type: "bevy_transform_xyz" },
                        { kind: "block", type: "bevy_transform_translation" },
                        { kind: "block", type: "bevy_transform_rotation" },
                        { kind: "block", type: "bevy_transform_scale" }
                    ]
                },
                
                // Time
                {
                    kind: "category",
                    name: "Time",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_time_delta" },
                        { kind: "block", type: "bevy_time_elapsed" }
                    ]
                },
                
                // Events
                {
                    kind: "category",
                    name: "Events",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_read_events" },
                        { kind: "block", type: "bevy_send_event" }
                    ]
                },
                
                // Assets & Materials
                {
                    kind: "category",
                    name: "Assets & Materials",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Asset Loading" },
                        { kind: "block", type: "bevy_load_asset" },
                        { kind: "label", text: "Mesh Primitives" },
                        { kind: "block", type: "bevy_mesh_primitive" },
                        { kind: "block", type: "bevy_mesh_primitive_sized" },
                        { kind: "label", text: "Simple Materials" },
                        { kind: "block", type: "bevy_standard_material" },
                        { kind: "label", text: "Advanced Materials" },
                        { kind: "block", type: "bevy_standard_material_full" },
                        { kind: "block", type: "bevy_material_emissive" },
                        { kind: "block", type: "bevy_material_textured" },
                        { kind: "block", type: "bevy_material_normal_map" },
                        { kind: "block", type: "bevy_material_alpha_mode" },
                        { kind: "block", type: "bevy_material_unlit" },
                        { kind: "block", type: "bevy_material_double_sided" },
                        { kind: "label", text: "Colors" },
                        { kind: "block", type: "bevy_color_const" },
                        { kind: "block", type: "bevy_color_srgb" },
                        { kind: "block", type: "bevy_color_srgba" }
                    ]
                },
                
                // Input
                {
                    kind: "category",
                    name: "Input",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_key_pressed" },
                        { kind: "block", type: "bevy_key_just_pressed" }
                    ]
                },
                
                // State Management
                {
                    kind: "category",
                    name: "State Management",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_set_state" },
                        { kind: "block", type: "bevy_in_state" },
                        { kind: "block", type: "bevy_on_enter" },
                        { kind: "block", type: "bevy_on_exit" }
                    ]
                },
                
                // Resources
                {
                    kind: "category",
                    name: "Resources",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_is_changed" }
                    ]
                },
                
                // Rendering Effects
                {
                    kind: "category",
                    name: "Rendering Effects",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Fog" },
                        { kind: "block", type: "bevy_fog_settings" },
                        { kind: "block", type: "bevy_fog_falloff_linear" },
                        { kind: "block", type: "bevy_fog_falloff_exponential" },
                        { kind: "label", text: "Post-Processing" },
                        { kind: "block", type: "bevy_bloom_settings" },
                        { kind: "block", type: "bevy_tonemapping" },
                        { kind: "label", text: "Lighting" },
                        { kind: "block", type: "bevy_ambient_light" },
                        { kind: "block", type: "bevy_cascaded_shadow_config" },
                        { kind: "label", text: "Environment" },
                        { kind: "block", type: "bevy_skybox" },
                        { kind: "block", type: "bevy_clear_color" },
                        { kind: "label", text: "Quality" },
                        { kind: "block", type: "bevy_msaa" },
                        { kind: "label", text: "Visibility" },
                        { kind: "block", type: "bevy_visibility" },
                        { kind: "block", type: "bevy_wireframe" },
                        { kind: "block", type: "bevy_no_wireframe" }
                    ]
                },
                
                // Physics
                {
                    kind: "category",
                    name: "Physics",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_velocity" }
                    ]
                },
                
                // UI
                {
                    kind: "category",
                    name: "UI",
                    colour: 120,
                    contents: [
                        { kind: "label", text: "Text" },
                        { kind: "block", type: "bevy_text_bundle" },
                        { kind: "block", type: "bevy_text" },
                        { kind: "block", type: "bevy_text_style" },
                        { kind: "label", text: "Layout" },
                        { kind: "block", type: "bevy_node_bundle" },
                        { kind: "block", type: "bevy_ui_style" }
                    ]
                },
                
                // Entity & References
                {
                    kind: "category",
                    name: "Entity & References",
                    colour: 120,
                    contents: [
                        { kind: "block", type: "bevy_entity" },
                        { kind: "block", type: "bevy_reference_node" }
                    ]
                }
            ]
        };
    }
};

