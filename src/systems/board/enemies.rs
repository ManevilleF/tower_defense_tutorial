use crate::{
    components::*,
    resources::{board::BoardConfig, hex::HexConfig, visuals::EnemyVisuals},
};
use bevy::{prelude::*, utils::HashMap};

const Z_POS: f32 = 30.0;

pub fn movement(
    config: Res<BoardConfig>,
    hex_config: Res<HexConfig>,
    paths: Query<(Entity, &EnemyPath)>,
    mut enemies: Query<(&mut Transform, &mut Movement)>,
    time: Res<Time>,
) {
    let delta_time = time.delta_seconds();
    let lerp_unit = config.enemy_speed * delta_time;
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

        movement.lerp += lerp_unit;
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

pub fn spawn(
    config: Res<BoardConfig>,
    visuals: Res<EnemyVisuals>,
    mut commands: Commands,
    paths: Query<(&GlobalTransform, Entity), With<EnemyPath>>,
    mut timer: Local<f32>,
    time: Res<Time>,
) {
    *timer += time.delta_seconds();
    if *timer < config.enemy_spawn_tick {
        return;
    }
    *timer -= config.enemy_spawn_tick;
    let health = config.base_enemy_health;
    for (transform, path_entity) in &paths {
        let pos = transform.translation();
        commands.spawn((
            ColorMesh2dBundle {
                mesh: visuals.mesh.clone().into(),
                material: visuals.health_mats[health as usize].clone(),
                transform: Transform::from_xyz(pos.x, pos.y, Z_POS),
                ..default()
            },
            Name::new("Enemy"),
            Health(health),
            Movement {
                path_entity,
                index: 0,
                lerp: 0.0,
            },
        ));
    }
}
