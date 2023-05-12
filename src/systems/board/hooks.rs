use crate::{
    components::board::{Blocked, Coords, EnemyPath, Path, Spawner, Target},
    resources::{board::HexBoard, visuals::ColumnVisuals},
};
use bevy::{log, prelude::*};
use hexx::Hex;

pub fn handle_blocked_tiles(
    mut removals: RemovedComponents<Blocked>,
    changes: Query<Entity, (Added<Blocked>, With<Coords>)>,
    mut tiles: Query<(&Coords, &mut Transform, &mut Handle<StandardMaterial>)>,
    visuals: Res<ColumnVisuals>,
    mut board: ResMut<HexBoard>,
) {
    let mut count = 0;
    let mut iter = tiles.iter_many_mut(removals.iter());
    while let Some((coord, mut transform, mut material)) = iter.fetch_next() {
        board.blocked_tiles.remove(coord);
        transform.translation.y = 0.0;
        *material = visuals.default_mat.clone();
        count += 1;
    }
    let mut iter = tiles.iter_many_mut(changes.iter());
    while let Some((coord, mut transform, mut material)) = iter.fetch_next() {
        transform.translation.y = HexBoard::COLUMN_UNIT_HEIGHT;
        *material = visuals.blocked_mat.clone();
        count += 1;
        board.blocked_tiles.insert(coord.0);
    }
    if count > 0 {
        log::info!("Handled {count} blocked tiles");
    }
}

pub fn handle_path_tiles(
    mut removals: RemovedComponents<Path>,
    changes: Query<Entity, (Added<Path>, With<Coords>)>,
    mut tiles: Query<(
        &mut Handle<StandardMaterial>,
        Option<&Target>,
        Option<&Blocked>,
        Option<&Spawner>,
    )>,
    visuals: Res<ColumnVisuals>,
) {
    let mut count = 0;
    let mut iter = tiles.iter_many_mut(removals.iter());
    while let Some((mut material, target, blocked, spawner)) = iter.fetch_next() {
        if target.is_none() && spawner.is_none() && blocked.is_none() {
            *material = visuals.default_mat.clone();
        }
        count += 1;
    }
    let mut iter = tiles.iter_many_mut(changes.iter());
    while let Some((mut material, target, blocked, spawner)) = iter.fetch_next() {
        if target.is_none() && spawner.is_none() && blocked.is_none() {
            *material = visuals.path_mat.clone();
        }
        count += 1;
    }
    if count > 0 {
        log::info!("Handled {count} path tiles");
    }
}

pub fn handle_spawner_tiles(
    mut changed_tiles: Query<&mut Handle<StandardMaterial>, Added<Spawner>>,
    visuals: Res<ColumnVisuals>,
) {
    let mut count = 0;
    for mut material in &mut changed_tiles {
        *material = visuals.spawner_mat.clone();
        count += 1;
    }
    if count > 0 {
        log::info!("Handled {count} spawner tiles");
    }
}

pub fn compute_enemy_paths(
    mut commands: Commands,
    board: Res<HexBoard>,
    mut spawners: Query<(&Coords, &mut EnemyPath)>,
    path_tiles: Query<Entity, With<Path>>,
) {
    for entity in &path_tiles {
        commands.entity(entity).remove::<Path>();
    }
    for (coord, mut path) in &mut spawners {
        let new_path = board.shortest_path(coord.0, Hex::ZERO);
        for c in &new_path {
            let mut cmd = commands.entity(board.tile_entities[c]);
            if board.blocked_tiles.contains(c) {
                log::info!("Removed blocked coordinate {c:?} to fix path");
                cmd.remove::<Blocked>();
            }
            cmd.insert(Path);
        }
        path.0 = new_path;
    }
}
