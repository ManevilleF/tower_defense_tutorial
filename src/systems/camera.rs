use bevy::{core_pipeline::fxaa::Fxaa, prelude::*};

pub fn setup(mut commands: Commands) {
    commands.spawn((
        Camera2dBundle { ..default() },
        Fxaa::default(),
        Name::new("Camera"),
    ));
}
