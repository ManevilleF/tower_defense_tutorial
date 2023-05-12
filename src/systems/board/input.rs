use std::ops::DerefMut;

use crate::components::board::{Blocked, Selector, Spawner, Target};
use crate::events::TileClicked;
use crate::resources::input::InputState;
use crate::resources::visuals::{InputVisuals, COLUMN_HEIGHT};
use crate::resources::{
    board::{BoardConfig, HexBoard},
    hex::HexConfig,
};
use bevy::pbr::NotShadowCaster;
use bevy::{input::mouse::MouseWheel, log, prelude::*};
use hexx::Hex;

pub fn reset_board(mut commands: Commands, keys: Res<Input<KeyCode>>) {
    if keys.just_pressed(KeyCode::R) {
        log::info!("Regenerating board");
        commands.insert_resource(BoardConfig::default());
    }
}

pub fn setup(mut commands: Commands, visuals: Res<InputVisuals>) {
    commands.spawn((
        PbrBundle {
            mesh: visuals.selector_mesh.clone(),
            material: visuals.selected_mat.clone(),
            ..default()
        },
        NotShadowCaster,
        Selector,
    ));
}

#[allow(clippy::too_many_arguments)]
pub fn select_tile(
    board: Res<HexBoard>,
    config: Res<HexConfig>,
    windows: Query<&Window>,
    projections: Query<&Projection>,
    mouse_input: Res<Input<MouseButton>>,
    transforms: Query<&GlobalTransform>,
    mut selector: Query<&mut Transform, With<Selector>>,
    mut selection: Local<Hex>,
    mut clicked_evw: EventWriter<TileClicked>,
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
    if *selection != coord {
        *selection = coord;
        let entity = match board.tile_entities.get(&selection) {
            Some(e) => *e,
            None => return,
        };
        let mut select_tranform = selector.single_mut();
        let target_transform = transforms.get(entity).unwrap();
        select_tranform.translation = target_transform.transform_point(Vec3::Y * 2.0);
    }
    if mouse_input.just_pressed(MouseButton::Left) {
        clicked_evw.send(TileClicked(coord));
    }
}

pub fn apply_action(
    mut commands: Commands,
    mut events: EventReader<TileClicked>,
    state: Res<InputState>,
    board: Res<HexBoard>,
    tiles: Query<Option<&Blocked>, (Without<Target>, Without<Spawner>)>,
) {
    for TileClicked(coord) in events.iter() {
        log::info!("Clicked on {coord:?} for {state:?}");
        let entity = match board.tile_entities.get(coord) {
            Some(e) => *e,
            None => continue,
        };
        match *state {
            InputState::ToggleBlocked => {
                let blocked = match tiles.get(entity) {
                    Ok(b) => b,
                    Err(_) => continue,
                };
                if blocked.is_some() {
                    commands.entity(entity).remove::<Blocked>();
                } else {
                    commands.entity(entity).insert(Blocked);
                }
            }
            InputState::Build => todo!(),
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
