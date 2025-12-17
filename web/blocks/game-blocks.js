// Game Development Blocks - Scratch-like interface for Bevy
// Mode: bevy
// Naming convention: game_*
// High-level game development blocks inspired by Scratch

Blockly.defineBlocksWithJsonArray([
    // ============================================================================
    // MOVEMENT BLOCKS (Scratch-like)
    // ============================================================================

    {
        type: "game_move_forward",
        message0: "move forward %1 units",
        args0: [
            { type: "input_value", name: "DISTANCE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Move entity forward in its facing direction",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_move_to",
        message0: "move to x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Move entity to specific position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_glide_to",
        message0: "glide to x: %1 y: %2 z: %3 in %4 seconds",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" },
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Smoothly move entity to position over time",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_turn_degrees",
        message0: "turn %1 %2 degrees",
        args0: [
            { type: "field_dropdown", name: "DIRECTION", options: [
                ["↻ right", "RIGHT"],
                ["↺ left", "LEFT"]
            ]},
            { type: "input_value", name: "DEGREES", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Rotate entity by degrees",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_point_direction",
        message0: "point in direction %1",
        args0: [
            { type: "input_value", name: "ANGLE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set entity rotation to specific angle",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_point_towards",
        message0: "point towards x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Rotate entity to face a position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_change_position",
        message0: "change x by %1 y by %2 z by %3",
        args0: [
            { type: "input_value", name: "DX", check: "Number" },
            { type: "input_value", name: "DY", check: "Number" },
            { type: "input_value", name: "DZ", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Change entity position by offset",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_velocity",
        message0: "set velocity x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "VX", check: "Number" },
            { type: "input_value", name: "VY", check: "Number" },
            { type: "input_value", name: "VZ", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set entity velocity for physics",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // INPUT BLOCKS
    // ============================================================================

    {
        type: "game_key_pressed",
        message0: "key %1 pressed?",
        args0: [
            { type: "field_dropdown", name: "KEY", options: [
                ["space", "Space"],
                ["↑ up arrow", "ArrowUp"],
                ["↓ down arrow", "ArrowDown"],
                ["← left arrow", "ArrowLeft"],
                ["→ right arrow", "ArrowRight"],
                ["W", "KeyW"],
                ["A", "KeyA"],
                ["S", "KeyS"],
                ["D", "KeyD"],
                ["Enter", "Enter"],
                ["Escape", "Escape"]
            ]}
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Check if key is currently pressed",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_key_just_pressed",
        message0: "key %1 just pressed?",
        args0: [
            { type: "field_dropdown", name: "KEY", options: [
                ["space", "Space"],
                ["↑ up arrow", "ArrowUp"],
                ["↓ down arrow", "ArrowDown"],
                ["← left arrow", "ArrowLeft"],
                ["→ right arrow", "ArrowRight"],
                ["W", "KeyW"],
                ["A", "KeyA"],
                ["S", "KeyS"],
                ["D", "KeyD"],
                ["Enter", "Enter"],
                ["Escape", "Escape"]
            ]}
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Check if key was just pressed this frame",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_mouse_button_pressed",
        message0: "mouse %1 pressed?",
        args0: [
            { type: "field_dropdown", name: "BUTTON", options: [
                ["left", "Left"],
                ["right", "Right"],
                ["middle", "Middle"]
            ]}
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Check if mouse button is pressed",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_mouse_position",
        message0: "mouse %1",
        args0: [
            { type: "field_dropdown", name: "AXIS", options: [
                ["x", "X"],
                ["y", "Y"]
            ]}
        ],
        output: "Number",
        colour: 210,
        tooltip: "Get mouse position",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // COLLISION DETECTION
    // ============================================================================

    {
        type: "game_touching",
        message0: "touching %1 ?",
        args0: [
            { type: "field_input", name: "TAG", text: "Enemy" }
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Check if entity is touching another with tag",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_distance_to",
        message0: "distance to x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        output: "Number",
        colour: 210,
        tooltip: "Calculate distance to position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_on_collision",
        message0: "when colliding with %1 %2 %3",
        args0: [
            { type: "field_input", name: "TAG", text: "Wall" },
            { type: "input_dummy" },
            { type: "input_statement", name: "DO" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Execute code when collision occurs",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // GAME STATE & VARIABLES
    // ============================================================================

    {
        type: "game_score",
        message0: "score",
        output: "Number",
        colour: 210,
        tooltip: "Get current score",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_change_score",
        message0: "change score by %1",
        args0: [
            { type: "input_value", name: "AMOUNT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Add to score",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_score",
        message0: "set score to %1",
        args0: [
            { type: "input_value", name: "VALUE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set score to value",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_lives",
        message0: "lives",
        output: "Number",
        colour: 210,
        tooltip: "Get current lives",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_change_lives",
        message0: "change lives by %1",
        args0: [
            { type: "input_value", name: "AMOUNT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Add to lives",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_timer",
        message0: "timer",
        output: "Number",
        colour: 210,
        tooltip: "Get elapsed game time in seconds",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_reset_timer",
        message0: "reset timer",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Reset game timer to zero",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // APPEARANCE & EFFECTS
    // ============================================================================

    {
        type: "game_show",
        message0: "show",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Make entity visible",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_hide",
        message0: "hide",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Make entity invisible",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_color",
        message0: "set color to r: %1 g: %2 b: %3",
        args0: [
            { type: "input_value", name: "R", check: "Number" },
            { type: "input_value", name: "G", check: "Number" },
            { type: "input_value", name: "B", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set entity color (0.0 to 1.0)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_size",
        message0: "set size to %1 %",
        args0: [
            { type: "input_value", name: "PERCENT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set entity scale as percentage",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_change_size",
        message0: "change size by %1 %",
        args0: [
            { type: "input_value", name: "PERCENT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Change entity scale by percentage",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // SOUND BLOCKS
    // ============================================================================

    {
        type: "game_play_sound",
        message0: "play sound %1",
        args0: [
            { type: "field_input", name: "SOUND", text: "jump.ogg" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Play a sound effect",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_play_sound_until_done",
        message0: "play sound %1 until done",
        args0: [
            { type: "field_input", name: "SOUND", text: "music.ogg" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Play sound and wait until finished",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_stop_all_sounds",
        message0: "stop all sounds",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Stop all playing sounds",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_volume",
        message0: "set volume to %1 %",
        args0: [
            { type: "input_value", name: "VOLUME", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set sound volume (0-100)",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // SPAWNING & CLONING
    // ============================================================================

    {
        type: "game_spawn_entity",
        message0: "spawn %1 at x: %2 y: %3 z: %4",
        args0: [
            { type: "field_input", name: "PREFAB", text: "Enemy" },
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Create new entity at position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_destroy_self",
        message0: "destroy self",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Remove this entity from game",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_destroy_entity",
        message0: "destroy %1",
        args0: [
            { type: "field_input", name: "TAG", text: "Enemy" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Destroy all entities with tag",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // CONTROL FLOW (Game-specific)
    // ============================================================================

    {
        type: "game_when_game_starts",
        message0: "when game starts %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "DO" }
        ],
        colour: 210,
        tooltip: "Run code when game starts",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_every_frame",
        message0: "every frame %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "DO" }
        ],
        colour: 210,
        tooltip: "Run code every frame (Update)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_wait_seconds",
        message0: "wait %1 seconds",
        args0: [
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Pause execution for duration",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_repeat_forever",
        message0: "forever %1 %2",
        args0: [
            { type: "input_dummy" },
            { type: "input_statement", name: "DO" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Repeat code forever",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // POSITION GETTERS
    // ============================================================================

    {
        type: "game_position_x",
        message0: "x position",
        output: "Number",
        colour: 210,
        tooltip: "Get entity X position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_position_y",
        message0: "y position",
        output: "Number",
        colour: 210,
        tooltip: "Get entity Y position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_position_z",
        message0: "z position",
        output: "Number",
        colour: 210,
        tooltip: "Get entity Z position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_direction",
        message0: "direction",
        output: "Number",
        colour: 210,
        tooltip: "Get entity rotation in degrees",
        helpUrl: "",
        mode: "bevy"
    }
]);

// ============================================================================
// ADDITIONAL GAME BLOCKS - Part 2
// ============================================================================

Blockly.defineBlocksWithJsonArray([
    // ============================================================================
    // ANIMATION BLOCKS
    // ============================================================================

    {
        type: "game_animate_property",
        message0: "animate %1 from %2 to %3 over %4 seconds",
        args0: [
            { type: "field_dropdown", name: "PROPERTY", options: [
                ["position", "POSITION"],
                ["rotation", "ROTATION"],
                ["scale", "SCALE"],
                ["color", "COLOR"]
            ]},
            { type: "input_value", name: "FROM" },
            { type: "input_value", name: "TO" },
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Animate a property over time",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_play_animation",
        message0: "play animation %1 %2",
        args0: [
            { type: "field_input", name: "ANIMATION", text: "walk" },
            { type: "field_dropdown", name: "MODE", options: [
                ["once", "ONCE"],
                ["loop", "LOOP"],
                ["ping-pong", "PINGPONG"]
            ]}
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Play sprite/skeletal animation",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_stop_animation",
        message0: "stop animation",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Stop current animation",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_animation_speed",
        message0: "set animation speed to %1 x",
        args0: [
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Change animation playback speed",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // CAMERA BLOCKS
    // ============================================================================

    {
        type: "game_camera_follow",
        message0: "camera follow %1 with smoothing %2",
        args0: [
            { type: "field_input", name: "TARGET", text: "Player" },
            { type: "input_value", name: "SMOOTHING", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Make camera follow entity smoothly",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_camera_shake",
        message0: "shake camera intensity %1 duration %2",
        args0: [
            { type: "input_value", name: "INTENSITY", check: "Number" },
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Shake camera for impact effect",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_camera_zoom",
        message0: "set camera zoom to %1",
        args0: [
            { type: "input_value", name: "ZOOM", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Change camera zoom level",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_camera_bounds",
        message0: "set camera bounds min x: %1 y: %2 max x: %3 y: %4",
        args0: [
            { type: "input_value", name: "MIN_X", check: "Number" },
            { type: "input_value", name: "MIN_Y", check: "Number" },
            { type: "input_value", name: "MAX_X", check: "Number" },
            { type: "input_value", name: "MAX_Y", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Limit camera movement area",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // HEALTH & DAMAGE SYSTEM
    // ============================================================================

    {
        type: "game_health",
        message0: "health",
        output: "Number",
        colour: 210,
        tooltip: "Get current health",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_max_health",
        message0: "max health",
        output: "Number",
        colour: 210,
        tooltip: "Get maximum health",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_take_damage",
        message0: "take %1 damage",
        args0: [
            { type: "input_value", name: "AMOUNT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Reduce health by amount",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_heal",
        message0: "heal %1 health",
        args0: [
            { type: "input_value", name: "AMOUNT", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Restore health",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_health",
        message0: "set health to %1",
        args0: [
            { type: "input_value", name: "VALUE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set health to specific value",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_is_dead",
        message0: "is dead?",
        output: "Boolean",
        colour: 210,
        tooltip: "Check if health is zero",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_invincible",
        message0: "set invincible for %1 seconds",
        args0: [
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Make entity invincible temporarily",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // PARTICLE EFFECTS
    // ============================================================================

    {
        type: "game_spawn_particles",
        message0: "spawn %1 particles at x: %2 y: %3 z: %4",
        args0: [
            { type: "field_dropdown", name: "TYPE", options: [
                ["✨ sparkle", "SPARKLE"],
                ["💥 explosion", "EXPLOSION"],
                ["💨 smoke", "SMOKE"],
                ["🔥 fire", "FIRE"],
                ["💧 water", "WATER"],
                ["⭐ stars", "STARS"]
            ]},
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Create particle effect",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_particle_trail",
        message0: "create %1 trail",
        args0: [
            { type: "field_dropdown", name: "TYPE", options: [
                ["smoke", "SMOKE"],
                ["fire", "FIRE"],
                ["sparkle", "SPARKLE"]
            ]}
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Create particle trail behind entity",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // INVENTORY SYSTEM
    // ============================================================================

    {
        type: "game_add_item",
        message0: "add %1 to inventory",
        args0: [
            { type: "field_input", name: "ITEM", text: "Key" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Add item to inventory",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_remove_item",
        message0: "remove %1 from inventory",
        args0: [
            { type: "field_input", name: "ITEM", text: "Key" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Remove item from inventory",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_has_item",
        message0: "has %1 in inventory?",
        args0: [
            { type: "field_input", name: "ITEM", text: "Key" }
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Check if item is in inventory",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_item_count",
        message0: "count of %1 in inventory",
        args0: [
            { type: "field_input", name: "ITEM", text: "Coin" }
        ],
        output: "Number",
        colour: 210,
        tooltip: "Get quantity of item",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_clear_inventory",
        message0: "clear inventory",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Remove all items",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // PHYSICS & FORCES
    // ============================================================================

    {
        type: "game_apply_force",
        message0: "apply force x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Apply physics force",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_apply_impulse",
        message0: "apply impulse x: %1 y: %2 z: %3",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Apply instant force (jump, knockback)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_set_gravity",
        message0: "set gravity to %1",
        args0: [
            { type: "input_value", name: "GRAVITY", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Change gravity strength",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_bounce",
        message0: "set bounce to %1",
        args0: [
            { type: "input_value", name: "RESTITUTION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set bounciness (0=no bounce, 1=full bounce)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_friction",
        message0: "set friction to %1",
        args0: [
            { type: "input_value", name: "FRICTION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Set surface friction",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_is_grounded",
        message0: "is on ground?",
        output: "Boolean",
        colour: 210,
        tooltip: "Check if entity is touching ground",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // AI & BEHAVIOR
    // ============================================================================

    {
        type: "game_move_towards",
        message0: "move towards x: %1 y: %2 z: %3 speed %4",
        args0: [
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "Z", check: "Number" },
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Move entity towards target position",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_follow_entity",
        message0: "follow %1 at speed %2",
        args0: [
            { type: "field_input", name: "TARGET", text: "Player" },
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Follow another entity",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_flee_from",
        message0: "flee from %1 at speed %2",
        args0: [
            { type: "field_input", name: "TARGET", text: "Enemy" },
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Run away from entity",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_patrol",
        message0: "patrol between x1: %1 z1: %2 and x2: %3 z2: %4 speed %5",
        args0: [
            { type: "input_value", name: "X1", check: "Number" },
            { type: "input_value", name: "Z1", check: "Number" },
            { type: "input_value", name: "X2", check: "Number" },
            { type: "input_value", name: "Z2", check: "Number" },
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Patrol between two points",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_wander",
        message0: "wander randomly speed %1 radius %2",
        args0: [
            { type: "input_value", name: "SPEED", check: "Number" },
            { type: "input_value", name: "RADIUS", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Move randomly within radius",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // SPAWNING & WAVES
    // ============================================================================

    {
        type: "game_spawn_wave",
        message0: "spawn wave of %1 %2 count %3 spread %4",
        args0: [
            { type: "field_input", name: "ENTITY", text: "Enemy" },
            { type: "input_dummy" },
            { type: "input_value", name: "COUNT", check: "Number" },
            { type: "input_value", name: "SPREAD", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Spawn multiple entities in a wave",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_spawn_at_random",
        message0: "spawn %1 at random position in radius %2",
        args0: [
            { type: "field_input", name: "ENTITY", text: "Pickup" },
            { type: "input_value", name: "RADIUS", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Spawn at random location",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_count_entities",
        message0: "count of %1 entities",
        args0: [
            { type: "field_input", name: "TAG", text: "Enemy" }
        ],
        output: "Number",
        colour: 210,
        tooltip: "Count entities with tag",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // UI & HUD
    // ============================================================================

    {
        type: "game_show_text",
        message0: "show text %1 at x: %2 y: %3 for %4 seconds",
        args0: [
            { type: "input_value", name: "TEXT", check: "String" },
            { type: "input_value", name: "X", check: "Number" },
            { type: "input_value", name: "Y", check: "Number" },
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Display temporary text message",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_show_notification",
        message0: "show notification %1",
        args0: [
            { type: "input_value", name: "MESSAGE", check: "String" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Show notification popup",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_update_hud",
        message0: "update HUD %1 to %2",
        args0: [
            { type: "field_input", name: "ELEMENT", text: "score_text" },
            { type: "input_value", name: "VALUE" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Update HUD element",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_show_healthbar",
        message0: "show health bar",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Display health bar UI",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_hide_healthbar",
        message0: "hide health bar",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Hide health bar UI",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // GAME STATE & LEVELS
    // ============================================================================

    {
        type: "game_load_level",
        message0: "load level %1",
        args0: [
            { type: "field_input", name: "LEVEL", text: "level_1" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Load a game level",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_next_level",
        message0: "go to next level",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Advance to next level",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_restart_level",
        message0: "restart level",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Restart current level",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_pause",
        message0: "pause game",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Pause game execution",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_resume",
        message0: "resume game",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Resume game execution",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_is_paused",
        message0: "is game paused?",
        output: "Boolean",
        colour: 210,
        tooltip: "Check if game is paused",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_game_over",
        message0: "game over",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Trigger game over state",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_win",
        message0: "win game",
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Trigger win state",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // RANDOM & MATH
    // ============================================================================

    {
        type: "game_random_range",
        message0: "random from %1 to %2",
        args0: [
            { type: "input_value", name: "MIN", check: "Number" },
            { type: "input_value", name: "MAX", check: "Number" }
        ],
        output: "Number",
        colour: 210,
        tooltip: "Generate random number in range",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_random_chance",
        message0: "%1 % chance",
        args0: [
            { type: "input_value", name: "PERCENT", check: "Number" }
        ],
        output: "Boolean",
        colour: 210,
        tooltip: "Random chance (true/false)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_pick_random",
        message0: "pick random %1",
        args0: [
            { type: "field_input", name: "OPTIONS", text: "A, B, C" }
        ],
        output: "String",
        colour: 210,
        tooltip: "Pick random from comma-separated list",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // ADVANCED MOVEMENT
    // ============================================================================

    {
        type: "game_dash",
        message0: "dash in direction %1 distance %2",
        args0: [
            { type: "input_value", name: "DIRECTION", check: "Number" },
            { type: "input_value", name: "DISTANCE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Quick dash movement",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_jump",
        message0: "jump with force %1",
        args0: [
            { type: "input_value", name: "FORCE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Make entity jump",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_double_jump",
        message0: "double jump with force %1",
        args0: [
            { type: "input_value", name: "FORCE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Perform double jump if available",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_wall_jump",
        message0: "wall jump with force %1",
        args0: [
            { type: "input_value", name: "FORCE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Jump off wall",
        helpUrl: "",
        mode: "bevy"
    },

    // ============================================================================
    // EFFECTS & JUICE
    // ============================================================================

    {
        type: "game_screen_flash",
        message0: "flash screen color r: %1 g: %2 b: %3 duration %4",
        args0: [
            { type: "input_value", name: "R", check: "Number" },
            { type: "input_value", name: "G", check: "Number" },
            { type: "input_value", name: "B", check: "Number" },
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Flash screen with color",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_slow_motion",
        message0: "set time scale to %1",
        args0: [
            { type: "input_value", name: "SCALE", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Slow down or speed up time (1.0 = normal)",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_freeze_frame",
        message0: "freeze for %1 seconds",
        args0: [
            { type: "input_value", name: "DURATION", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Freeze game briefly for impact",
        helpUrl: "",
        mode: "bevy"
    },

    {
        type: "game_pulse_size",
        message0: "pulse size from %1 to %2 speed %3",
        args0: [
            { type: "input_value", name: "MIN", check: "Number" },
            { type: "input_value", name: "MAX", check: "Number" },
            { type: "input_value", name: "SPEED", check: "Number" }
        ],
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: "Pulsing scale animation",
        helpUrl: "",
        mode: "bevy"
    }
]);

