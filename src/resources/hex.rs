use bevy::prelude::*;
use hexx::{HexLayout, HexOrientation};

const HEX_SIZE: Vec2 = Vec2::ONE;

#[derive(Debug, Resource)]
pub struct HexConfig {
    pub layout: HexLayout,
}

impl FromWorld for HexConfig {
    fn from_world(_world: &mut World) -> Self {
        Self {
            layout: HexLayout {
                orientation: HexOrientation::flat(),
                hex_size: HEX_SIZE,
                ..default()
            },
        }
    }
}
