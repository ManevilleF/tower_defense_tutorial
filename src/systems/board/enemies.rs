use crate::{
    components::*,
    resources::{board::BoardConfig, hex::HexConfig, visuals::EnemyVisuals, GameRng},
};
use bevy::{prelude::*, utils::HashMap};
use rand::Rng;

const Z_POS: f32 = 30.0;

pub fn movement(
    hex_config: Res<HexConfig>,
    paths: Query<(Entity, &EnemyPath)>,
    mut enemies: Query<(&mut Transform, &mut Movement)>,
    time: Res<Time>,
) {
    let delta_time = time.delta_seconds();
    let paths: HashMap<Entity, Vec<Vec3>> = paths
        .iter()
        .map(|(e, p)| {
            let path = p
                .iter()
                .map(|&h| hex_config.layout.hex_to_world_pos(h).extend(Z_POS))
                .collect();
            (e, path)
        })
        .collect();
    for (mut transform, mut movement) in &mut enemies {
        let path = &paths[&movement.path_entity];

        movement.lerp += movement.speed * delta_time;
        if movement.lerp > 1.0 {
            movement.lerp -= 1.0;
            movement.index += 1;
        }
        let prev_pos = path.get(movement.index).copied().unwrap_or_default();
        let next_pos = path.get(movement.index + 1).copied().unwrap_or_default();
        let pos = prev_pos.lerp(next_pos, movement.lerp);
        transform.translation = pos;
    }
}

pub fn handle_health(
    mut commands: Commands,
    config: Res<BoardConfig>,
    mut healths: Query<(Entity, &mut Transform, &Health, &mut Movement), Changed<Health>>,
) {
    let max_health = *config.base_enemy_health.end() as f32;
    for (entity, mut transform, health, mut movement) in &mut healths {
        if health.0 == 0 {
            commands.entity(entity).despawn();
            continue;
        }
        let ratio = health.0 as f32 / max_health;
        transform.scale = Vec3::splat(ratio);
        movement.speed = config.max_enemy_speed / ratio;
    }
}

pub fn spawn(
    config: Res<BoardConfig>,
    visuals: Res<EnemyVisuals>,
    mut commands: Commands,
    paths: Query<(&GlobalTransform, Entity), With<EnemyPath>>,
    mut timer: Local<f32>,
    mut rng: ResMut<GameRng>,
    time: Res<Time>,
) {
    *timer += time.delta_seconds();
    if *timer < config.enemy_spawn_tick {
        return;
    }
    *timer -= config.enemy_spawn_tick;
    for (transform, path_entity) in &paths {
        let pos = transform.translation();
        commands.spawn((
            ColorMesh2dBundle {
                mesh: visuals.mesh.clone().into(),
                material: visuals.mat.clone(),
                transform: Transform::from_xyz(pos.x, pos.y, Z_POS).with_scale(Vec3::ZERO),
                ..default()
            },
            Name::new("Enemy"),
            Health(rng.gen_range(config.base_enemy_health.clone())),
            Movement {
                path_entity,
                index: 0,
                lerp: 0.0,
                speed: config.max_enemy_speed,
            },
        ));
    }
}
