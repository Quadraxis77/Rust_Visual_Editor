/**
 * Game Development Code Generator for Blockly System
 * Generates Bevy ECS code from Scratch-like game blocks
 */

// Game blocks use the Bevy generator
const GameGenerator = BevyGenerator;

// ============================================================================
// MOVEMENT BLOCKS
// ============================================================================

GameGenerator.forBlock['game_move_forward'] = function(block) {
    const distance = GameGenerator.valueToCode(block, 'DISTANCE', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Move forward
transform.translation += transform.forward() * ${distance};\n`;
};

GameGenerator.forBlock['game_move_to'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `transform.translation = Vec3::new(${x}, ${y}, ${z});\n`;
};

GameGenerator.forBlock['game_glide_to'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Glide to position (requires interpolation component)
let target = Vec3::new(${x}, ${y}, ${z});
let speed = (target - transform.translation).length() / ${duration};
transform.translation = transform.translation.lerp(target, time.delta_secs() * speed);\n`;
};

GameGenerator.forBlock['game_turn_degrees'] = function(block) {
    const direction = block.getFieldValue('DIRECTION');
    const degrees = GameGenerator.valueToCode(block, 'DEGREES', GameGenerator.ORDER_NONE) || '90.0';
    
    const sign = direction === 'RIGHT' ? '' : '-';
    
    return `transform.rotate_y(${sign}(${degrees}).to_radians());\n`;
};

GameGenerator.forBlock['game_point_direction'] = function(block) {
    const angle = GameGenerator.valueToCode(block, 'ANGLE', GameGenerator.ORDER_NONE) || '0.0';
    
    return `transform.rotation = Quat::from_rotation_y((${angle}).to_radians());\n`;
};

GameGenerator.forBlock['game_point_towards'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `let target = Vec3::new(${x}, ${y}, ${z});
transform.look_at(target, Vec3::Y);\n`;
};

GameGenerator.forBlock['game_change_position'] = function(block) {
    const dx = GameGenerator.valueToCode(block, 'DX', GameGenerator.ORDER_NONE) || '0.0';
    const dy = GameGenerator.valueToCode(block, 'DY', GameGenerator.ORDER_NONE) || '0.0';
    const dz = GameGenerator.valueToCode(block, 'DZ', GameGenerator.ORDER_NONE) || '0.0';
    
    return `transform.translation += Vec3::new(${dx}, ${dy}, ${dz});\n`;
};

GameGenerator.forBlock['game_set_velocity'] = function(block) {
    const vx = GameGenerator.valueToCode(block, 'VX', GameGenerator.ORDER_NONE) || '0.0';
    const vy = GameGenerator.valueToCode(block, 'VY', GameGenerator.ORDER_NONE) || '0.0';
    const vz = GameGenerator.valueToCode(block, 'VZ', GameGenerator.ORDER_NONE) || '0.0';
    
    return `// Set velocity (requires Velocity component)
velocity.linvel = Vec3::new(${vx}, ${vy}, ${vz});\n`;
};

// ============================================================================
// INPUT BLOCKS
// ============================================================================

GameGenerator.forBlock['game_key_pressed'] = function(block) {
    const key = block.getFieldValue('KEY');
    
    return [`keyboard.pressed(KeyCode::${key})`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_key_just_pressed'] = function(block) {
    const key = block.getFieldValue('KEY');
    
    return [`keyboard.just_pressed(KeyCode::${key})`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_mouse_button_pressed'] = function(block) {
    const button = block.getFieldValue('BUTTON');
    
    return [`mouse.pressed(MouseButton::${button})`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_mouse_position'] = function(block) {
    const axis = block.getFieldValue('AXIS');
    
    return [`mouse_position.${axis.toLowerCase()}`, GameGenerator.ORDER_ATOMIC];
};

// ============================================================================
// COLLISION DETECTION
// ============================================================================

GameGenerator.forBlock['game_touching'] = function(block) {
    const tag = block.getFieldValue('TAG');
    
    return [`// Check collision with ${tag}
collision_events.iter().any(|e| e.has_tag("${tag}"))`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_distance_to'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return [`transform.translation.distance(Vec3::new(${x}, ${y}, ${z}))`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_on_collision'] = function(block) {
    const tag = block.getFieldValue('TAG');
    const doCode = GameGenerator.statementToCode(block, 'DO');
    
    return `// On collision with ${tag}
if collision_events.iter().any(|e| e.has_tag("${tag}")) {
${doCode}}\n`;
};

// ============================================================================
// GAME STATE & VARIABLES
// ============================================================================

GameGenerator.forBlock['game_score'] = function(block) {
    return ['game_state.score', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_change_score'] = function(block) {
    const amount = GameGenerator.valueToCode(block, 'AMOUNT', GameGenerator.ORDER_NONE) || '1';
    
    return `game_state.score += ${amount};\n`;
};

GameGenerator.forBlock['game_set_score'] = function(block) {
    const value = GameGenerator.valueToCode(block, 'VALUE', GameGenerator.ORDER_NONE) || '0';
    
    return `game_state.score = ${value};\n`;
};

GameGenerator.forBlock['game_lives'] = function(block) {
    return ['game_state.lives', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_change_lives'] = function(block) {
    const amount = GameGenerator.valueToCode(block, 'AMOUNT', GameGenerator.ORDER_NONE) || '1';
    
    return `game_state.lives += ${amount};\n`;
};

GameGenerator.forBlock['game_timer'] = function(block) {
    return ['time.elapsed_secs()', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_reset_timer'] = function(block) {
    return `// Reset timer (requires custom timer resource)
game_timer.reset();\n`;
};

// ============================================================================
// APPEARANCE & EFFECTS
// ============================================================================

GameGenerator.forBlock['game_show'] = function(block) {
    return `visibility.is_visible = true;\n`;
};

GameGenerator.forBlock['game_hide'] = function(block) {
    return `visibility.is_visible = false;\n`;
};

GameGenerator.forBlock['game_set_color'] = function(block) {
    const r = GameGenerator.valueToCode(block, 'R', GameGenerator.ORDER_NONE) || '1.0';
    const g = GameGenerator.valueToCode(block, 'G', GameGenerator.ORDER_NONE) || '1.0';
    const b = GameGenerator.valueToCode(block, 'B', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Set material color
material.base_color = Color::srgb(${r}, ${g}, ${b});\n`;
};

GameGenerator.forBlock['game_set_size'] = function(block) {
    const percent = GameGenerator.valueToCode(block, 'PERCENT', GameGenerator.ORDER_NONE) || '100.0';
    
    return `let scale = ${percent} / 100.0;
transform.scale = Vec3::splat(scale);\n`;
};

GameGenerator.forBlock['game_change_size'] = function(block) {
    const percent = GameGenerator.valueToCode(block, 'PERCENT', GameGenerator.ORDER_NONE) || '10.0';
    
    return `let scale_change = ${percent} / 100.0;
transform.scale *= 1.0 + scale_change;\n`;
};

// ============================================================================
// SOUND BLOCKS
// ============================================================================

GameGenerator.forBlock['game_play_sound'] = function(block) {
    const sound = block.getFieldValue('SOUND');
    
    return `// Play sound
commands.spawn(AudioBundle {
    source: asset_server.load("sounds/${sound}"),
    ..default()
});\n`;
};

GameGenerator.forBlock['game_play_sound_until_done'] = function(block) {
    const sound = block.getFieldValue('SOUND');
    
    return `// Play sound until done (requires audio system)
commands.spawn(AudioBundle {
    source: asset_server.load("sounds/${sound}"),
    settings: PlaybackSettings::ONCE,
    ..default()
});\n`;
};

GameGenerator.forBlock['game_stop_all_sounds'] = function(block) {
    return `// Stop all sounds
for entity in audio_query.iter() {
    commands.entity(entity).despawn();
}\n`;
};

GameGenerator.forBlock['game_set_volume'] = function(block) {
    const volume = GameGenerator.valueToCode(block, 'VOLUME', GameGenerator.ORDER_NONE) || '100.0';
    
    return `// Set volume
audio_settings.volume = ${volume} / 100.0;\n`;
};

// ============================================================================
// SPAWNING & CLONING
// ============================================================================

GameGenerator.forBlock['game_spawn_entity'] = function(block) {
    const prefab = block.getFieldValue('PREFAB');
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `// Spawn ${prefab}
commands.spawn((
    ${prefab}Tag,
    TransformBundle::from_transform(Transform::from_xyz(${x}, ${y}, ${z})),
));\n`;
};

GameGenerator.forBlock['game_destroy_self'] = function(block) {
    return `commands.entity(entity).despawn();\n`;
};

GameGenerator.forBlock['game_destroy_entity'] = function(block) {
    const tag = block.getFieldValue('TAG');
    
    return `// Destroy all ${tag} entities
for entity in ${tag.toLowerCase()}_query.iter() {
    commands.entity(entity).despawn();
}\n`;
};

// ============================================================================
// CONTROL FLOW (Game-specific)
// ============================================================================

GameGenerator.forBlock['game_when_game_starts'] = function(block) {
    const doCode = GameGenerator.statementToCode(block, 'DO');
    
    return `// Startup system
fn game_start_system(
    mut commands: Commands,
) {
${doCode}}

// Add to app: app.add_systems(Startup, game_start_system);\n\n`;
};

GameGenerator.forBlock['game_every_frame'] = function(block) {
    const doCode = GameGenerator.statementToCode(block, 'DO');
    
    return `// Update system
fn game_update_system(
    time: Res<Time>,
    mut query: Query<&mut Transform>,
) {
${doCode}}

// Add to app: app.add_systems(Update, game_update_system);\n\n`;
};

GameGenerator.forBlock['game_wait_seconds'] = function(block) {
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Wait (requires timer component)
timer.tick(time.delta());
if timer.elapsed_secs() < ${duration} {
    return;
}\n`;
};

GameGenerator.forBlock['game_repeat_forever'] = function(block) {
    const doCode = GameGenerator.statementToCode(block, 'DO');
    
    return `// Forever loop (runs every frame in Update system)
${doCode}`;
};

// ============================================================================
// POSITION GETTERS
// ============================================================================

GameGenerator.forBlock['game_position_x'] = function(block) {
    return ['transform.translation.x', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_position_y'] = function(block) {
    return ['transform.translation.y', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_position_z'] = function(block) {
    return ['transform.translation.z', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_direction'] = function(block) {
    return ['transform.rotation.to_euler(EulerRot::YXZ).0.to_degrees()', GameGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ANIMATION BLOCKS
// ============================================================================

GameGenerator.forBlock['game_animate_property'] = function(block) {
    const property = block.getFieldValue('PROPERTY');
    const from = GameGenerator.valueToCode(block, 'FROM', GameGenerator.ORDER_NONE) || '0.0';
    const to = GameGenerator.valueToCode(block, 'TO', GameGenerator.ORDER_NONE) || '1.0';
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '1.0';
    
    const propertyMap = {
        'POSITION': 'translation',
        'ROTATION': 'rotation',
        'SCALE': 'scale',
        'COLOR': 'color'
    };
    
    return `// Animate ${propertyMap[property]}
animation.${propertyMap[property]}_from = ${from};
animation.${propertyMap[property]}_to = ${to};
animation.duration = ${duration};
animation.start();\n`;
};

GameGenerator.forBlock['game_play_animation'] = function(block) {
    const animation = block.getFieldValue('ANIMATION');
    const mode = block.getFieldValue('MODE');
    
    const modeMap = {
        'ONCE': 'RepeatMode::Once',
        'LOOP': 'RepeatMode::Loop',
        'PINGPONG': 'RepeatMode::PingPong'
    };
    
    return `// Play animation
animation_player.play("${animation}").set_repeat(${modeMap[mode]});\n`;
};

GameGenerator.forBlock['game_stop_animation'] = function(block) {
    return `animation_player.stop();\n`;
};

GameGenerator.forBlock['game_animation_speed'] = function(block) {
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    
    return `animation_player.set_speed(${speed});\n`;
};

// ============================================================================
// CAMERA BLOCKS
// ============================================================================

GameGenerator.forBlock['game_camera_follow'] = function(block) {
    const target = block.getFieldValue('TARGET');
    const smoothing = GameGenerator.valueToCode(block, 'SMOOTHING', GameGenerator.ORDER_NONE) || '5.0';
    
    return `// Camera follow ${target}
if let Ok(target_transform) = ${target.toLowerCase()}_query.get_single() {
    let target_pos = target_transform.translation;
    camera_transform.translation = camera_transform.translation.lerp(
        Vec3::new(target_pos.x, target_pos.y, camera_transform.translation.z),
        time.delta_secs() * ${smoothing}
    );
}\n`;
};

GameGenerator.forBlock['game_camera_shake'] = function(block) {
    const intensity = GameGenerator.valueToCode(block, 'INTENSITY', GameGenerator.ORDER_NONE) || '0.5';
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '0.3';
    
    return `// Camera shake
camera_shake.intensity = ${intensity};
camera_shake.duration = ${duration};
camera_shake.start();\n`;
};

GameGenerator.forBlock['game_camera_zoom'] = function(block) {
    const zoom = GameGenerator.valueToCode(block, 'ZOOM', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Set camera zoom
camera_projection.scale = ${zoom};\n`;
};

GameGenerator.forBlock['game_camera_bounds'] = function(block) {
    const minX = GameGenerator.valueToCode(block, 'MIN_X', GameGenerator.ORDER_NONE) || '-10.0';
    const minY = GameGenerator.valueToCode(block, 'MIN_Y', GameGenerator.ORDER_NONE) || '-10.0';
    const maxX = GameGenerator.valueToCode(block, 'MAX_X', GameGenerator.ORDER_NONE) || '10.0';
    const maxY = GameGenerator.valueToCode(block, 'MAX_Y', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Camera bounds
camera_transform.translation.x = camera_transform.translation.x.clamp(${minX}, ${maxX});
camera_transform.translation.y = camera_transform.translation.y.clamp(${minY}, ${maxY});\n`;
};

// ============================================================================
// HEALTH & DAMAGE SYSTEM
// ============================================================================

GameGenerator.forBlock['game_health'] = function(block) {
    return ['health.current', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_max_health'] = function(block) {
    return ['health.max', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_take_damage'] = function(block) {
    const amount = GameGenerator.valueToCode(block, 'AMOUNT', GameGenerator.ORDER_NONE) || '1';
    
    return `health.current = (health.current - ${amount}).max(0.0);\n`;
};

GameGenerator.forBlock['game_heal'] = function(block) {
    const amount = GameGenerator.valueToCode(block, 'AMOUNT', GameGenerator.ORDER_NONE) || '1';
    
    return `health.current = (health.current + ${amount}).min(health.max);\n`;
};

GameGenerator.forBlock['game_set_health'] = function(block) {
    const value = GameGenerator.valueToCode(block, 'VALUE', GameGenerator.ORDER_NONE) || '100';
    
    return `health.current = ${value}.min(health.max);\n`;
};

GameGenerator.forBlock['game_is_dead'] = function(block) {
    return ['health.current <= 0.0', GameGenerator.ORDER_RELATIONAL];
};

GameGenerator.forBlock['game_invincible'] = function(block) {
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '2.0';
    
    return `// Set invincibility
invincibility.duration = ${duration};
invincibility.timer = 0.0;\n`;
};

// ============================================================================
// PARTICLE EFFECTS
// ============================================================================

GameGenerator.forBlock['game_spawn_particles'] = function(block) {
    const type = block.getFieldValue('TYPE');
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `// Spawn ${type} particles
commands.spawn(ParticleEffectBundle {
    effect: ParticleEffect::${type},
    transform: Transform::from_xyz(${x}, ${y}, ${z}),
    ..default()
});\n`;
};

GameGenerator.forBlock['game_particle_trail'] = function(block) {
    const type = block.getFieldValue('TYPE');
    
    return `// Add ${type} trail
commands.entity(entity).insert(ParticleTrail::${type});\n`;
};

// ============================================================================
// INVENTORY SYSTEM
// ============================================================================

GameGenerator.forBlock['game_add_item'] = function(block) {
    const item = block.getFieldValue('ITEM');
    
    return `inventory.add("${item}");\n`;
};

GameGenerator.forBlock['game_remove_item'] = function(block) {
    const item = block.getFieldValue('ITEM');
    
    return `inventory.remove("${item}");\n`;
};

GameGenerator.forBlock['game_has_item'] = function(block) {
    const item = block.getFieldValue('ITEM');
    
    return [`inventory.has("${item}")`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_item_count'] = function(block) {
    const item = block.getFieldValue('ITEM');
    
    return [`inventory.count("${item}")`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_clear_inventory'] = function(block) {
    return `inventory.clear();\n`;
};

// ============================================================================
// PHYSICS & FORCES
// ============================================================================

GameGenerator.forBlock['game_apply_force'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `external_force.force = Vec3::new(${x}, ${y}, ${z});\n`;
};

GameGenerator.forBlock['game_apply_impulse'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    
    return `external_impulse.impulse = Vec3::new(${x}, ${y}, ${z});\n`;
};

GameGenerator.forBlock['game_set_gravity'] = function(block) {
    const gravity = GameGenerator.valueToCode(block, 'GRAVITY', GameGenerator.ORDER_NONE) || '-9.81';
    
    return `gravity_scale.0 = ${gravity};\n`;
};

GameGenerator.forBlock['game_bounce'] = function(block) {
    const restitution = GameGenerator.valueToCode(block, 'RESTITUTION', GameGenerator.ORDER_NONE) || '0.5';
    
    return `restitution.coefficient = ${restitution};\n`;
};

GameGenerator.forBlock['game_friction'] = function(block) {
    const friction = GameGenerator.valueToCode(block, 'FRICTION', GameGenerator.ORDER_NONE) || '0.5';
    
    return `friction.coefficient = ${friction};\n`;
};

GameGenerator.forBlock['game_is_grounded'] = function(block) {
    return ['grounded_detector.is_grounded', GameGenerator.ORDER_ATOMIC];
};

// ============================================================================
// AI & BEHAVIOR
// ============================================================================

GameGenerator.forBlock['game_move_towards'] = function(block) {
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const z = GameGenerator.valueToCode(block, 'Z', GameGenerator.ORDER_NONE) || '0.0';
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Move towards target
let target = Vec3::new(${x}, ${y}, ${z});
let direction = (target - transform.translation).normalize();
transform.translation += direction * ${speed} * time.delta_secs();\n`;
};

GameGenerator.forBlock['game_follow_entity'] = function(block) {
    const target = block.getFieldValue('TARGET');
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Follow ${target}
if let Ok(target_transform) = ${target.toLowerCase()}_query.get_single() {
    let direction = (target_transform.translation - transform.translation).normalize();
    transform.translation += direction * ${speed} * time.delta_secs();
}\n`;
};

GameGenerator.forBlock['game_flee_from'] = function(block) {
    const target = block.getFieldValue('TARGET');
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Flee from ${target}
if let Ok(target_transform) = ${target.toLowerCase()}_query.get_single() {
    let direction = (transform.translation - target_transform.translation).normalize();
    transform.translation += direction * ${speed} * time.delta_secs();
}\n`;
};

GameGenerator.forBlock['game_patrol'] = function(block) {
    const x1 = GameGenerator.valueToCode(block, 'X1', GameGenerator.ORDER_NONE) || '-5.0';
    const z1 = GameGenerator.valueToCode(block, 'Z1', GameGenerator.ORDER_NONE) || '0.0';
    const x2 = GameGenerator.valueToCode(block, 'X2', GameGenerator.ORDER_NONE) || '5.0';
    const z2 = GameGenerator.valueToCode(block, 'Z2', GameGenerator.ORDER_NONE) || '0.0';
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    
    return `// Patrol behavior
let point_a = Vec3::new(${x1}, transform.translation.y, ${z1});
let point_b = Vec3::new(${x2}, transform.translation.y, ${z2});
let target = if patrol.going_to_b { point_b } else { point_a };
let direction = (target - transform.translation).normalize();
transform.translation += direction * ${speed} * time.delta_secs();
if transform.translation.distance(target) < 0.5 {
    patrol.going_to_b = !patrol.going_to_b;
}\n`;
};

GameGenerator.forBlock['game_wander'] = function(block) {
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '1.0';
    const radius = GameGenerator.valueToCode(block, 'RADIUS', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Wander behavior
if wander.timer <= 0.0 {
    wander.target = Vec3::new(
        rand::random::<f32>() * ${radius} * 2.0 - ${radius},
        transform.translation.y,
        rand::random::<f32>() * ${radius} * 2.0 - ${radius}
    );
    wander.timer = 2.0;
}
wander.timer -= time.delta_secs();
let direction = (wander.target - transform.translation).normalize();
transform.translation += direction * ${speed} * time.delta_secs();\n`;
};

// ============================================================================
// SPAWNING & WAVES
// ============================================================================

GameGenerator.forBlock['game_spawn_wave'] = function(block) {
    const entity = block.getFieldValue('ENTITY');
    const count = GameGenerator.valueToCode(block, 'COUNT', GameGenerator.ORDER_NONE) || '5';
    const spread = GameGenerator.valueToCode(block, 'SPREAD', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Spawn wave of ${entity}
for i in 0..${count} {
    let angle = (i as f32 / ${count} as f32) * std::f32::consts::TAU;
    let offset = Vec3::new(angle.cos() * ${spread}, 0.0, angle.sin() * ${spread});
    commands.spawn((
        ${entity}Tag,
        TransformBundle::from_transform(Transform::from_translation(offset)),
    ));
}\n`;
};

GameGenerator.forBlock['game_spawn_at_random'] = function(block) {
    const entity = block.getFieldValue('ENTITY');
    const radius = GameGenerator.valueToCode(block, 'RADIUS', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Spawn ${entity} at random position
let random_pos = Vec3::new(
    (rand::random::<f32>() * 2.0 - 1.0) * ${radius},
    0.0,
    (rand::random::<f32>() * 2.0 - 1.0) * ${radius}
);
commands.spawn((
    ${entity}Tag,
    TransformBundle::from_transform(Transform::from_translation(random_pos)),
));\n`;
};

GameGenerator.forBlock['game_count_entities'] = function(block) {
    const tag = block.getFieldValue('TAG');
    
    return [`${tag.toLowerCase()}_query.iter().count()`, GameGenerator.ORDER_ATOMIC];
};

// ============================================================================
// UI & HUD
// ============================================================================

GameGenerator.forBlock['game_show_text'] = function(block) {
    const text = GameGenerator.valueToCode(block, 'TEXT', GameGenerator.ORDER_NONE) || '"Message"';
    const x = GameGenerator.valueToCode(block, 'X', GameGenerator.ORDER_NONE) || '0.0';
    const y = GameGenerator.valueToCode(block, 'Y', GameGenerator.ORDER_NONE) || '0.0';
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '2.0';
    
    return `// Show temporary text
commands.spawn((
    TextBundle::from_section(${text}, TextStyle::default())
        .with_style(Style {
            position_type: PositionType::Absolute,
            left: Val::Px(${x}),
            top: Val::Px(${y}),
            ..default()
        }),
    TemporaryText { duration: ${duration}, timer: 0.0 }
));\n`;
};

GameGenerator.forBlock['game_show_notification'] = function(block) {
    const message = GameGenerator.valueToCode(block, 'MESSAGE', GameGenerator.ORDER_NONE) || '"Notification"';
    
    return `// Show notification
notification_events.send(NotificationEvent { message: ${message}.to_string() });\n`;
};

GameGenerator.forBlock['game_update_hud'] = function(block) {
    const element = block.getFieldValue('ELEMENT');
    const value = GameGenerator.valueToCode(block, 'VALUE', GameGenerator.ORDER_NONE) || '0';
    
    return `// Update HUD
if let Ok(mut text) = ${element}_query.get_single_mut() {
    text.sections[0].value = format!("{}", ${value});
}\n`;
};

GameGenerator.forBlock['game_show_healthbar'] = function(block) {
    return `healthbar_visibility.is_visible = true;\n`;
};

GameGenerator.forBlock['game_hide_healthbar'] = function(block) {
    return `healthbar_visibility.is_visible = false;\n`;
};

// ============================================================================
// GAME STATE & LEVELS
// ============================================================================

GameGenerator.forBlock['game_load_level'] = function(block) {
    const level = block.getFieldValue('LEVEL');
    
    return `// Load level
next_state.set(GameState::Loading("${level}".to_string()));\n`;
};

GameGenerator.forBlock['game_next_level'] = function(block) {
    return `// Next level
game_state.current_level += 1;
next_state.set(GameState::Loading(format!("level_{}", game_state.current_level)));\n`;
};

GameGenerator.forBlock['game_restart_level'] = function(block) {
    return `// Restart level
next_state.set(GameState::Restart);\n`;
};

GameGenerator.forBlock['game_pause'] = function(block) {
    return `next_state.set(GameState::Paused);\n`;
};

GameGenerator.forBlock['game_resume'] = function(block) {
    return `next_state.set(GameState::Playing);\n`;
};

GameGenerator.forBlock['game_is_paused'] = function(block) {
    return ['matches!(game_state.get(), GameState::Paused)', GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_game_over'] = function(block) {
    return `next_state.set(GameState::GameOver);\n`;
};

GameGenerator.forBlock['game_win'] = function(block) {
    return `next_state.set(GameState::Win);\n`;
};

// ============================================================================
// RANDOM & MATH
// ============================================================================

GameGenerator.forBlock['game_random_range'] = function(block) {
    const min = GameGenerator.valueToCode(block, 'MIN', GameGenerator.ORDER_NONE) || '0.0';
    const max = GameGenerator.valueToCode(block, 'MAX', GameGenerator.ORDER_NONE) || '1.0';
    
    return [`(rand::random::<f32>() * (${max} - ${min}) + ${min})`, GameGenerator.ORDER_ATOMIC];
};

GameGenerator.forBlock['game_random_chance'] = function(block) {
    const percent = GameGenerator.valueToCode(block, 'PERCENT', GameGenerator.ORDER_NONE) || '50.0';
    
    return [`(rand::random::<f32>() * 100.0 < ${percent})`, GameGenerator.ORDER_RELATIONAL];
};

GameGenerator.forBlock['game_pick_random'] = function(block) {
    const options = block.getFieldValue('OPTIONS');
    
    return [`{
    let options = vec![${options.split(',').map(o => `"${o.trim()}"`).join(', ')}];
    options[rand::random::<usize>() % options.len()]
}`, GameGenerator.ORDER_ATOMIC];
};

// ============================================================================
// ADVANCED MOVEMENT
// ============================================================================

GameGenerator.forBlock['game_dash'] = function(block) {
    const direction = GameGenerator.valueToCode(block, 'DIRECTION', GameGenerator.ORDER_NONE) || '0.0';
    const distance = GameGenerator.valueToCode(block, 'DISTANCE', GameGenerator.ORDER_NONE) || '5.0';
    
    return `// Dash
let dash_direction = Quat::from_rotation_y((${direction}).to_radians()) * Vec3::Z;
dash.direction = dash_direction;
dash.distance = ${distance};
dash.active = true;\n`;
};

GameGenerator.forBlock['game_jump'] = function(block) {
    const force = GameGenerator.valueToCode(block, 'FORCE', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Jump
if grounded.is_grounded {
    velocity.linvel.y = ${force};
}\n`;
};

GameGenerator.forBlock['game_double_jump'] = function(block) {
    const force = GameGenerator.valueToCode(block, 'FORCE', GameGenerator.ORDER_NONE) || '8.0';
    
    return `// Double jump
if jump_state.jumps_remaining > 0 {
    velocity.linvel.y = ${force};
    jump_state.jumps_remaining -= 1;
}\n`;
};

GameGenerator.forBlock['game_wall_jump'] = function(block) {
    const force = GameGenerator.valueToCode(block, 'FORCE', GameGenerator.ORDER_NONE) || '10.0';
    
    return `// Wall jump
if wall_detector.touching_wall {
    velocity.linvel = Vec3::new(wall_detector.wall_normal.x * ${force}, ${force}, 0.0);
}\n`;
};

// ============================================================================
// EFFECTS & JUICE
// ============================================================================

GameGenerator.forBlock['game_screen_flash'] = function(block) {
    const r = GameGenerator.valueToCode(block, 'R', GameGenerator.ORDER_NONE) || '1.0';
    const g = GameGenerator.valueToCode(block, 'G', GameGenerator.ORDER_NONE) || '1.0';
    const b = GameGenerator.valueToCode(block, 'B', GameGenerator.ORDER_NONE) || '1.0';
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '0.2';
    
    return `// Screen flash
screen_flash.color = Color::srgb(${r}, ${g}, ${b});
screen_flash.duration = ${duration};
screen_flash.timer = 0.0;\n`;
};

GameGenerator.forBlock['game_slow_motion'] = function(block) {
    const scale = GameGenerator.valueToCode(block, 'SCALE', GameGenerator.ORDER_NONE) || '0.5';
    
    return `time_scale.0 = ${scale};\n`;
};

GameGenerator.forBlock['game_freeze_frame'] = function(block) {
    const duration = GameGenerator.valueToCode(block, 'DURATION', GameGenerator.ORDER_NONE) || '0.1';
    
    return `// Freeze frame
freeze_frame.duration = ${duration};
freeze_frame.timer = 0.0;\n`;
};

GameGenerator.forBlock['game_pulse_size'] = function(block) {
    const min = GameGenerator.valueToCode(block, 'MIN', GameGenerator.ORDER_NONE) || '0.9';
    const max = GameGenerator.valueToCode(block, 'MAX', GameGenerator.ORDER_NONE) || '1.1';
    const speed = GameGenerator.valueToCode(block, 'SPEED', GameGenerator.ORDER_NONE) || '2.0';
    
    return `// Pulse size
let pulse = (time.elapsed_secs() * ${speed}).sin() * 0.5 + 0.5;
let scale = ${min} + pulse * (${max} - ${min});
transform.scale = Vec3::splat(scale);\n`;
};
