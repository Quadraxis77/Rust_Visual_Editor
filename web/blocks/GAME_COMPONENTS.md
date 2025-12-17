# Required Components for Game Blocks

The game blocks generate Bevy ECS code that requires certain components and resources. Add these to your Bevy project:

## Basic Components

```rust
use bevy::prelude::*;

// Score Resource
#[derive(Resource, Default)]
pub struct Score {
    pub value: i32,
}

// Lives Resource  
#[derive(Resource, Default)]
pub struct Lives {
    pub value: i32,
}

// Health Component
#[derive(Component)]
pub struct Health {
    pub current: f32,
    pub max: f32,
}

impl Default for Health {
    fn default() -> Self {
        Self {
            current: 100.0,
            max: 100.0,
        }
    }
}

// Inventory Component
#[derive(Component, Default)]
pub struct Inventory {
    pub items: HashMap<String, u32>,
}

impl Inventory {
    pub fn add(&mut self, item: &str) {
        *self.items.entry(item.to_string()).or_insert(0) += 1;
    }
    
    pub fn remove(&mut self, item: &str) -> bool {
        if let Some(count) = self.items.get_mut(item) {
            if *count > 0 {
                *count -= 1;
                return true;
            }
        }
        false
    }
    
    pub fn has(&self, item: &str) -> bool {
        self.items.get(item).map_or(false, |&count| count > 0)
    }
    
    pub fn count(&self, item: &str) -> u32 {
        *self.items.get(item).unwrap_or(&0)
    }
    
    pub fn clear(&mut self) {
        self.items.clear();
    }
}
```

## Setup in main.rs

```rust
use bevy::prelude::*;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        // Add resources
        .init_resource::<Score>()
        .init_resource::<Lives>()
        // Add your systems
        .add_systems(Startup, setup)
        .add_systems(Update, (
            movement_system,
            input_system,
            // ... your other systems
        ))
        .run();
}

fn setup(mut commands: Commands) {
    // Spawn camera
    commands.spawn(Camera2dBundle::default());
    
    // Spawn player with components
    commands.spawn((
        SpriteBundle {
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            ..default()
        },
        Health::default(),
        Inventory::default(),
    ));
}
```

## System Parameter Examples

### Movement System
```rust
fn movement_system(
    time: Res<Time>,
    keyboard: Res<ButtonInput<KeyCode>>,
    mut query: Query<&mut Transform>,
) {
    for mut transform in query.iter_mut() {
        // Your generated movement code here
    }
}
```

### Input System
```rust
fn input_system(
    keyboard: Res<ButtonInput<KeyCode>>,
    mouse: Res<ButtonInput<MouseButton>>,
) {
    // Your generated input code here
}
```

### Game State System
```rust
fn game_state_system(
    mut score: ResMut<Score>,
    mut lives: ResMut<Lives>,
    mut query: Query<&mut Health>,
) {
    // Your generated game state code here
}
```

### Visibility System
```rust
fn visibility_system(
    mut query: Query<&mut Visibility>,
) {
    for mut visibility in query.iter_mut() {
        // Your generated visibility code here
    }
}
```

## Collision Detection

For collision detection, use `bevy_rapier2d` or `bevy_rapier3d`:

```toml
# Cargo.toml
[dependencies]
bevy = "0.12"
bevy_rapier2d = "0.23"  # or bevy_rapier3d for 3D
```

```rust
use bevy_rapier2d::prelude::*;

fn main() {
    App::new()
        .add_plugins((DefaultPlugins, RapierPhysicsPlugin::<NoUserData>::pixels_per_meter(100.0)))
        .add_plugins(RapierDebugRenderPlugin::default())
        // ... rest of setup
        .run();
}

// Add colliders to entities
commands.spawn((
    SpriteBundle { /* ... */ },
    RigidBody::Dynamic,
    Collider::ball(16.0),
));
```

## Tags for Collision

```rust
// Define marker components for different entity types
#[derive(Component)]
pub struct Player;

#[derive(Component)]
pub struct Enemy;

#[derive(Component)]
pub struct Coin;

#[derive(Component)]
pub struct Wall;

// Use in collision detection
fn collision_system(
    mut collision_events: EventReader<CollisionEvent>,
    player_query: Query<Entity, With<Player>>,
    enemy_query: Query<Entity, With<Enemy>>,
) {
    for collision_event in collision_events.read() {
        if let CollisionEvent::Started(e1, e2, _) = collision_event {
            // Check if player collided with enemy
            // ... handle collision
        }
    }
}
```

## Quick Start Template

```rust
use bevy::prelude::*;
use std::collections::HashMap;

// Resources
#[derive(Resource, Default)]
struct Score { value: i32 }

#[derive(Resource, Default)]
struct Lives { value: i32 }

// Components
#[derive(Component)]
struct Health { current: f32, max: f32 }

#[derive(Component, Default)]
struct Inventory { items: HashMap<String, u32> }

#[derive(Component)]
struct Player;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_resource::<Score>()
        .init_resource::<Lives>()
        .add_systems(Startup, setup)
        .add_systems(Update, game_system)
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::srgb(0.0, 0.5, 1.0),
                custom_size: Some(Vec2::new(50.0, 50.0)),
                ..default()
            },
            ..default()
        },
        Player,
        Health { current: 100.0, max: 100.0 },
        Inventory::default(),
    ));
}

fn game_system(
    time: Res<Time>,
    keyboard: Res<ButtonInput<KeyCode>>,
    mut score: ResMut<Score>,
    mut lives: ResMut<Lives>,
    mut query: Query<(&mut Transform, &mut Visibility, &mut Health), With<Player>>,
) {
    for (mut transform, mut visibility, mut health) in query.iter_mut() {
        // Paste your generated game block code here!
    }
}
```

## Tips

1. **Start Simple**: Begin with just Transform and basic movement
2. **Add Components Gradually**: Add Health, Inventory, etc. as needed
3. **Use Tags**: Create marker components (Player, Enemy, etc.) for collision
4. **Check Examples**: Look at Bevy examples for more patterns
5. **Read Generated Code**: The comments explain what's needed

Happy game making! 🎮
