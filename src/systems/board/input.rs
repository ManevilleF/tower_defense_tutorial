use crate::components::*;
use crate::events::*;
use crate::resources::board::SelectedBuilding;
use crate::resources::{
    board::{BoardConfig, HexBoard},
    hex::HexConfig,
    visuals::InputVisuals,
};
use bevy::{input::mouse::MouseWheel, log, prelude::*};
use hexx::Hex;

const Z_POS: f32 = 10.0;

pub fn reset_board(mut commands: Commands, keys: Res<Input<KeyCode>>, config: Res<BoardConfig>) {
    if keys.just_pressed(KeyCode::R) {
        log::info!("Regenerating board");
        commands.insert_resource(config.clone());
    }
}

pub fn setup(mut commands: Commands, visuals: Res<InputVisuals>) {
    commands.spawn((
        ColorMesh2dBundle {
            mesh: visuals.selector_mesh.clone().into(),
            material: visuals.selected_mat.clone(),
            transform: Transform::from_xyz(0.0, 0.0, Z_POS),
            ..default()
        },
        Selector,
        Name::new("Selector"),
    ));
}

#[allow(clippy::too_many_arguments)]
pub fn select_tile(
    config: Res<HexConfig>,
    selected_building: Res<SelectedBuilding>,
    windows: Query<&Window>,
    projections: Query<&OrthographicProjection>,
    mouse_input: Res<Input<MouseButton>>,
    mut selector: Query<&mut Transform, With<Selector>>,
    mut selection: Local<Hex>,
    mut building_evw: EventWriter<PlaceBuilding>,
    mut tile_evw: EventWriter<ToggleTile>,
) {
    let window = windows.single();
    let projection = projections.single();
    let scale = projection.scale;
    let pos = match window.cursor_position() {
        Some(p) => p,
        None => return,
    };
    let pos = (pos - Vec2::new(window.width(), window.height()) / 2.0) * scale;
    let coord = config.layout.world_pos_to_hex(pos);
    if *selection != coord {
        *selection = coord;
        let pos = config.layout.hex_to_world_pos(coord);
        let mut select_tranform = selector.single_mut();
        select_tranform.translation.x = pos.x;
        select_tranform.translation.y = pos.y;
    }
    if mouse_input.just_pressed(MouseButton::Left) {
        tile_evw.send(ToggleTile { coord });
    } else if mouse_input.just_pressed(MouseButton::Right) {
        building_evw.send(PlaceBuilding {
            coord,
            id: selected_building.0,
        })
    }
}

pub fn toggle_tile(
    mut events: EventReader<ToggleTile>,
    board: Res<HexBoard>,
    mut tiles: Query<&mut TileType>,
) {
    for event in events.iter() {
        let entity = match board.tile_entities.get(&event.coord) {
            Some(e) => *e,
            None => continue,
        };
        let mut tile = match tiles.get_mut(entity) {
            Ok(b) => b,
            Err(_) => continue,
        };
        match *tile {
            TileType::Default => *tile = TileType::Mountain,
            TileType::Mountain => *tile = TileType::Default,
            _ => (),
        }
    }
}

pub fn camera_zoom(
    mut scroll_evr: EventReader<MouseWheel>,
    mut projections: Query<&mut OrthographicProjection>,
    time: Res<Time>,
) {
    if scroll_evr.is_empty() {
        return;
    }
    let amount: f32 = scroll_evr.iter().map(|e| e.y).sum::<f32>() * time.raw_delta_seconds();
    let mut projection = projections.single_mut();
    projection.scale += amount;
    projection.scale = projection.scale.clamp(0.1, 5.0);
}
