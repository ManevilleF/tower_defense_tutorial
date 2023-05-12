use std::ops::DerefMut;

use crate::resources::{
    board::{BoardConfig, HexBoard},
    hex::HexConfig,
    visuals::ColumnVisuals,
};
use bevy::{input::mouse::MouseWheel, log, prelude::*};
use hexx::Hex;

pub fn reset_board(mut commands: Commands, keys: Res<Input<KeyCode>>) {
    if keys.just_pressed(KeyCode::R) {
        log::info!("Regenerating board");
        commands.insert_resource(BoardConfig::default());
    }
}

#[derive(Debug, Resource)]
pub struct SelectionData {
    pub coord: Hex,
    pub entity: Entity,
    pub previous_mat: Handle<StandardMaterial>,
}

pub fn select_tile(
    board: Res<HexBoard>,
    config: Res<HexConfig>,
    visuals: Res<ColumnVisuals>,
    windows: Query<&Window>,
    projections: Query<&Projection>,
    mut materials: Query<&mut Handle<StandardMaterial>>,
    mut selection: Local<SelectionData>,
) {
    let window = windows.single();
    let projection = projections.single();
    let scale = match projection {
        Projection::Perspective(_) => 1.0,
        Projection::Orthographic(o) => o.scale,
    };
    let pos = match window.cursor_position() {
        Some(p) => p,
        None => return,
    };
    let pos = Vec2::new(pos.x - window.width() / 2.0, window.height() / 2.0 - pos.y) * scale;
    let coord = config.layout.world_pos_to_hex(pos);
    selection.coord = coord;
    let entity = match board.tile_entities.get(&selection.coord) {
        Some(e) => *e,
        None => return,
    };
    if entity != selection.entity {
        if let Ok(mut handle) = materials.get_mut(selection.entity) {
            *handle = selection.previous_mat.clone();
        }
        if let Ok(mut handle) = materials.get_mut(entity) {
            selection.previous_mat = handle.clone();
            selection.entity = entity;
            *handle = visuals.selected_mat.clone();
        }
    }
}

pub fn camera_zoom(
    mut scroll_evr: EventReader<MouseWheel>,
    mut projections: Query<&mut Projection>,
    time: Res<Time>,
) {
    let amount: f32 = scroll_evr.iter().map(|e| e.y).sum::<f32>() * time.raw_delta_seconds();
    let mut projection = projections.single_mut();
    if let Projection::Orthographic(o) = projection.deref_mut() {
        o.scale += amount;
        o.scale = o.scale.clamp(0.01, 0.5);
    }
}

impl Default for SelectionData {
    fn default() -> Self {
        Self {
            coord: Default::default(),
            entity: Entity::from_raw(0),
            previous_mat: Default::default(),
        }
    }
}
