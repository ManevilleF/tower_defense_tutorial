use bevy::prelude::*;
use hexx::{HexLayout, HexOrientation};

pub const HEX_SIZE: f32 = 10.0;

#[derive(Debug, Resource)]
pub struct HexConfig {
    pub layout: HexLayout,
}

impl FromWorld for HexConfig {
    fn from_world(_world: &mut World) -> Self {
        Self {
            layout: HexLayout {
                orientation: HexOrientation::flat(),
                hex_size: Vec2::splat(HEX_SIZE),
                ..default()
            },
        }
    }
}
