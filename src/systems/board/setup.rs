use crate::{
    components::board::{Blocked, Board, Coords, Spawner, Target},
    resources::{
        board::{BoardConfig, HexBoard},
        hex::HexConfig,
        visuals::ColumnVisuals,
        GameRng,
    },
};
use bevy::{
    log,
    prelude::*,
    utils::{HashMap, HashSet},
};
use hexx::{DiagonalDirection, Hex};
use rand::{rngs::SmallRng, seq::IteratorRandom, Rng, SeedableRng};

pub fn board(
    mut commands: Commands,
    board: Option<Res<HexBoard>>,
    config: Res<BoardConfig>,
    visuals: Res<ColumnVisuals>,
    hex_config: Res<HexConfig>,
) {
    // Clear existing board
    if let Some(board) = board {
        commands.entity(board.entity).despawn_recursive();
    }
    let mut tile_entities = HashMap::with_capacity(Hex::range_count(config.map_radius));
    let entity = commands
        .spawn((SpatialBundle::default(), Name::new("Board"), Board))
        .with_children(|b| {
            for coord in Hex::ZERO.range(config.map_radius) {
                let pos = hex_config.layout.hex_to_world_pos(coord);
                let translation = Vec3::new(pos.x, 0.0, pos.y);
                let mut cmd = b.spawn((
                    PbrBundle {
                        transform: Transform::from_translation(translation),
                        mesh: visuals.mesh.clone(),
                        material: visuals.path_mat.clone(),
                        ..default()
                    },
                    Coords(coord),
                    Name::new(format!("{} {}", coord.x, coord.y)),
                ));
                if coord == Hex::ZERO {
                    cmd.insert((visuals.end_mat.clone(), Target));
                };
                let entity = cmd.id();
                tile_entities.insert(coord, entity);
            }
        })
        .id();
    log::info!("Spawned board with {} tiles", tile_entities.len());
    commands.insert_resource(GameRng(SmallRng::from_seed(config.rng_seed)));
    commands.insert_resource(HexBoard {
        entity,
        tile_entities,
        blocked_tiles: HashSet::new(),
    });
}

pub fn blocked_tiles(
    mut commands: Commands,
    config: Res<BoardConfig>,
    board: Res<HexBoard>,
    mut rng: ResMut<GameRng>,
) {
    for (c, entity) in board.tile_entities.iter() {
        if c.ulength() == 0 {
            continue;
        }
        if rng.gen_bool(1.0 / config.difficulty()) {
            commands.entity(*entity).insert(Blocked);
        }
    }
}

pub fn spawners(
    mut commands: Commands,
    config: Res<BoardConfig>,
    board: Res<HexBoard>,
    mut rng: ResMut<GameRng>,
) {
    let spawners: HashSet<_> = (0..6)
        .filter_map(|i| {
            let dir = DiagonalDirection::default().rotate_cw(i);
            Hex::ZERO
                .ring_edge(config.map_radius, dir)
                .choose(&mut rng.0)
        })
        .collect();
    for coord in spawners {
        commands
            .entity(board.tile_entities[&coord])
            .insert(Spawner {
                amount: config.enemy_count(0),
            });
    }
}
