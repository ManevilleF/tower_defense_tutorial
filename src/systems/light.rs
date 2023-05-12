use crate::components::light::LightController;
use bevy::{pbr::CascadeShadowConfigBuilder, prelude::*};

const BASE_LIGHT_DISTANCE: f32 = 50.0;
const LIGHT_SPEED: f32 = 0.2;

pub fn setup(mut commands: Commands) {
    let controller_entity = commands
        .spawn((
            SpatialBundle::default(),
            LightController,
            Name::new("Light Controller"),
        ))
        .id();
    commands
        .spawn((
            DirectionalLightBundle {
                directional_light: DirectionalLight {
                    shadows_enabled: true,
                    ..default()
                },
                transform: Transform::from_xyz(0.0, BASE_LIGHT_DISTANCE, BASE_LIGHT_DISTANCE)
                    .looking_at(Vec3::ZERO, Vec3::Y),
                cascade_shadow_config: CascadeShadowConfigBuilder {
                    first_cascade_far_bound: 10.0,
                    maximum_distance: 100.0,
                    minimum_distance: 5.0,
                    ..default()
                }
                .into(),
                ..default()
            },
            Name::new("Directional Light"),
        ))
        .set_parent(controller_entity);
}

pub fn animate(mut controller: Query<&mut Transform, With<LightController>>, time: Res<Time>) {
    let mut transform = controller.single_mut();
    transform.rotate_y(time.delta_seconds() * LIGHT_SPEED);
}
