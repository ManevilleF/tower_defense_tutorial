use crate::{
    components::*,
    events::ComputePaths,
    resources::{board::HexBoard, visuals::ColumnVisuals},
};
use bevy::{log, prelude::*, utils::HashSet};
use hexx::Hex;

#[allow(clippy::type_complexity)]
pub fn handle_changed_tiles(
    mut removals: RemovedComponents<Path>,
    changed_tiles: Query<Entity, Or<(Changed<TileType>, Added<Path>)>>,
    tiles: Query<(Ref<TileType>, &Children, Option<&Path>)>,
    mut materials: Query<&mut Handle<ColorMaterial>>,
    visuals: Res<ColumnVisuals>,
    mut compute_path_evw: EventWriter<ComputePaths>,
) {
    let entities: HashSet<_> = removals.iter().chain(changed_tiles.iter()).collect();
    if entities.is_empty() {
        return;
    }
    let mut count = 0;
    for (tile, children, path) in tiles.iter_many(entities) {
        let mut material = materials.get_mut(children[0]).unwrap();
        let mat = match *tile {
            TileType::Default => {
                if path.is_some() {
                    &visuals.path_mat
                } else {
                    &visuals.default_mat
                }
            }
            TileType::Mountain => {
                if path.is_some() {
                    &visuals.path_mat
                } else {
                    &visuals.blocked_mat
                }
            }
            TileType::Spawner => &visuals.spawner_mat,
            TileType::Target => &visuals.target_mat,
        };
        *material = mat.clone();
        if tile.is_changed() {
            count += 1;
        }
    }
    if count > 0 {
        log::info!("Handled {count} changed tiles");
        compute_path_evw.send(ComputePaths);
    }
}

pub fn handle_damage_tiles(
    visuals: Res<ColumnVisuals>,
    mut tiles: Query<(&mut Handle<ColorMaterial>, &Damage), Changed<Damage>>,
) {
    for (mut mat, damage) in &mut tiles {
        *mat = visuals
            .damage_mats
            .get((damage.0 as usize / 10).max(1))
            .unwrap_or(visuals.damage_mats.last().unwrap())
            .clone()
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
    log::info!("Refreshed enemy pathfinding");
}
