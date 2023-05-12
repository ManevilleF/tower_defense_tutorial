use crate::{
    components::board::{Blocked, Coords, Spawner},
    resources::{board::HexBoard, visuals::ColumnVisuals},
};
use bevy::{log, prelude::*};

pub fn handle_blocked_tiles(
    mut changed_tiles: Query<
        (&Coords, &mut Transform, &mut Handle<StandardMaterial>),
        Added<Blocked>,
    >,
    visuals: Res<ColumnVisuals>,
    mut board: ResMut<HexBoard>,
) {
    let mut count = 0;
    for (coord, mut transform, mut material) in &mut changed_tiles {
        transform.translation.y = HexBoard::COLUMN_UNIT_HEIGHT;
        *material = visuals.blocked_mat.clone();
        count += 1;
        board.blocked_tiles.insert(coord.0);
    }
    if count > 0 {
        log::info!("Handled {count} blocked tiles");
    }
}

pub fn handle_spawner_tiles(
    mut changed_tiles: Query<&mut Handle<StandardMaterial>, Added<Spawner>>,
    visuals: Res<ColumnVisuals>,
) {
    let mut count = 0;
    for mut material in &mut changed_tiles {
        *material = visuals.start_mat.clone();
        count += 1;
    }
    if count > 0 {
        log::info!("Handled {count} spawner tiles");
    }
}

pub fn compute_enemy_paths() {}
