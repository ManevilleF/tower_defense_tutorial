use crate::components::camera::CameraController;
use bevy::{core_pipeline::fxaa::Fxaa, prelude::*};

const BASE_CAMERA_DISTANCE: f32 = 50.0;
const CAMERA_SCALE: f32 = 0.1;

pub fn setup(mut commands: Commands) {
    let controller_entity = commands
        .spawn((
            TransformBundle::default(),
            CameraController,
            Name::new("Camera Controller"),
        ))
        .id();
    commands
        .spawn((
            Camera3dBundle {
                transform: Transform::from_xyz(0.0, BASE_CAMERA_DISTANCE, 0.0)
                    .looking_at(Vec3::ZERO, Vec3::NEG_Z),
                projection: OrthographicProjection {
                    scale: CAMERA_SCALE,
                    ..default()
                }
                .into(),
                ..default()
            },
            Fxaa::default(),
            Name::new("Camera"),
        ))
        .set_parent(controller_entity);
}
