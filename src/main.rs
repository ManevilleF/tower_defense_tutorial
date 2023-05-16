#[warn(clippy::all, clippy::nursery)]
#[forbid(unsafe_code)]
mod components;
mod events;
mod resources;
mod systems;

use bevy::prelude::*;
#[cfg(feature = "debug")]
use bevy_inspector_egui::quick::*;
use events::{ComputePaths, TileClicked};
use resources::{
    board::{BoardConfig, HexBoard},
    hex::HexConfig,
    input::InputState,
    visuals::{ColumnVisuals, EnemyVisuals, InputVisuals},
};

const APP_NAME: &str = env!("CARGO_PKG_NAME");
const APP_VERSION: &str = env!("CARGO_PKG_VERSION");

const BACKGROUND_COLOR: Color = Color::rgb(0.0, 0.9, 1.0);

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, SystemSet)]
enum GameSet {
    BoardSetup,
    Board,
    // Ui,
}

fn main() {
    let mut app = App::new();
    // Plugins
    app.insert_resource(ClearColor(BACKGROUND_COLOR))
        .insert_resource(AmbientLight {
            brightness: 0.5,
            ..default()
        })
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                resolution: (1_000.0, 1_000.0).into(),
                title: format!("{APP_NAME} {APP_VERSION}"),
                resizable: true,
                decorations: true,
                focused: true,
                ..default()
            }),
            ..default()
        }));
    #[cfg(feature = "debug")]
    app.add_plugin(WorldInspectorPlugin::new());
    // Game Resources
    app.init_resource::<HexConfig>()
        .init_resource::<ColumnVisuals>()
        .init_resource::<InputVisuals>()
        .init_resource::<EnemyVisuals>()
        .init_resource::<BoardConfig>()
        .init_resource::<InputState>();
    // Game events
    app.add_event::<TileClicked>().add_event::<ComputePaths>();
    // Systems
    app.add_startup_system(systems::camera::setup)
        .add_startup_system(systems::board::input::setup);
    app.add_systems(
        (
            systems::board::setup::board,
            apply_system_buffers,
            systems::board::setup::blocked_tiles,
            systems::board::setup::spawners,
        )
            .chain()
            .in_set(GameSet::BoardSetup),
    )
    .configure_set(GameSet::BoardSetup.run_if(should_generate_board))
    .add_systems(
        (
            systems::board::input::select_tile,
            systems::board::input::apply_action,
            systems::board::hooks::compute_enemy_paths,
            systems::board::hooks::handle_path_tiles,
            systems::board::hooks::handle_changed_tiles,
        )
            .chain()
            .in_set(GameSet::Board),
    )
    .add_systems(
        (
            systems::board::input::reset_board,
            systems::board::input::camera_zoom,
            systems::board::enemies::spawn,
            systems::board::enemies::movement,
            systems::board::enemies::handle_health,
        )
            .in_set(GameSet::Board),
    )
    .configure_set(GameSet::Board.after(GameSet::BoardSetup));
    // run the app
    app.run();
}

fn should_generate_board(config: Res<BoardConfig>) -> bool {
    config.is_changed()
}

fn should_compute_paths(board: Res<HexBoard>) -> bool {
    board.is_changed()
}
