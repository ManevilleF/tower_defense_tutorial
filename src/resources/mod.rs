/// Board resources
pub mod board;
/// Hexagon related resources
pub mod hex;
/// input resources
pub mod input;
/// Resources storing meshes, materials, etc
pub mod visuals;

use std::ops::{Deref, DerefMut};

use bevy::prelude::Resource;
use rand::rngs::SmallRng;

#[derive(Resource)]
pub struct GameRng(pub SmallRng);

impl Deref for GameRng {
    type Target = SmallRng;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl DerefMut for GameRng {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}
