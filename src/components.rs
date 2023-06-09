use bevy::prelude::*;
use hexx::Hex;

#[derive(Debug, Component, Deref)]
pub struct Coords(pub Hex);

#[derive(Debug, Component)]
pub struct Board;

/// Marker component for tiles with a tower
#[derive(Debug, Component, Deref)]
pub struct Building(pub usize);

/// Marker component for the selector mesh
#[derive(Debug, Component)]
pub struct Selector;

/// Marker component for tile part of of enemy path
#[derive(Debug, Component)]
pub struct Path;

#[derive(Debug, Default, Copy, Clone, Component, PartialEq, Eq)]
pub enum TileType {
    /// Regular tile
    #[default]
    Default,
    /// Blocker path
    Mountain,
    /// Enemy spawner
    Spawner,
    /// Enemy target tile
    Target,
}

/// Enemy path component associated to spawner tiles
#[derive(Debug, Component, Deref, Default)]
pub struct EnemyPath(pub Vec<Hex>);

/// Health component
#[derive(Debug, Component, Deref)]
pub struct Health(pub u8);

/// Health component
#[derive(Debug, Component, Deref)]
pub struct Damage(pub u8);

/// Enemy movement
#[derive(Debug, Component)]
pub struct Movement {
    pub path_entity: Entity,
    pub index: usize,
    pub lerp: f32,
    pub speed: f32,
}

impl TileType {
    pub const fn cost(&self) -> u32 {
        match self {
            Self::Mountain => 100,
            _ => 0,
        }
    }
}
