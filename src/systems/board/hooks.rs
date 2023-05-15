use crate::{
    components::*,
    events::ComputePaths,
    resources::{board::HexBoard, visuals::ColumnVisuals},
};
use bevy::{log, prelude::*};
use hexx::Hex;

pub fn handle_changed_tiles(
    mut tiles: Query<(&TileType, &mut Handle<ColorMaterial>), Changed<TileType>>,
    visuals: Res<ColumnVisuals>,
    mut compute_path_evw: EventWriter<ComputePaths>,
) {
    let mut count = 0;
    for (tile, mut material) in &mut tiles {
        let mat = match tile {
            TileType::Default => visuals.default_mat.clone(),
            TileType::Mountain => visuals.blocked_mat.clone(),
            TileType::Spawner => visuals.spawner_mat.clone(),
            TileType::Target => visuals.target_mat.clone(),
        };
        *material = mat;
        count += 1;
    }
    if count > 0 {
        log::info!("Handled {count} changed tiles");
        compute_path_evw.send(ComputePaths);
    }
}

pub fn handle_path_tiles(
    mut removals: RemovedComponents<Path>,
    changes: Query<Entity, (Added<Path>, With<Coords>)>,
    mut tiles: Query<&mut Transform, With<Coords>>,
) {
    let mut count = 0;
    let mut iter = tiles.iter_many_mut(removals.iter());
    while let Some(mut transform) = iter.fetch_next() {
        transform.scale = HexBoard::DEFAULT_SCALE;
        count += 1;
    }
    let mut iter = tiles.iter_many_mut(changes.iter());
    while let Some(mut transform) = iter.fetch_next() {
        transform.scale = HexBoard::PATH_SCALE;
        count += 1;
    }
    if count > 0 {
        log::info!("Handled {count} path tiles");
    }
}

pub fn compute_enemy_paths(
    mut commands: Commands,
    board: Res<HexBoard>,
    mut spawners: Query<(&Coords, &mut EnemyPath)>,
    path_tiles: Query<Entity, With<Path>>,
    tiles: Query<&TileType>,
    mut compute_evr: EventReader<ComputePaths>,
) {
    let events = compute_evr.iter().count();
    if events == 0 {
        return;
    }
    for entity in &path_tiles {
        commands.entity(entity).remove::<Path>();
    }
    let cost = |entity: &Entity| tiles.get(*entity).ok().map(|t| t.cost());
    for (coord, mut path) in &mut spawners {
        let new_path = board.shortest_path(coord.0, Hex::ZERO, cost);
        for c in &new_path {
            let mut cmd = commands.entity(board.tile_entities[c]);
            cmd.insert(Path);
        }
        path.0 = new_path;
    }
}
