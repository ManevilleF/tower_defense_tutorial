use bevy::prelude::*;
use hexx::Hex;

#[derive(Debug, Component, Deref)]
pub struct Coords(pub Hex);

#[derive(Debug, Component)]
pub struct Board;

/// Target tile marker component
#[derive(Debug, Component)]
pub struct Target;

/// Blocked tile marker component
#[derive(Debug, Component)]
pub struct Blocked;

/// Enemy spawner tile component
#[derive(Debug, Component)]
pub struct Spawner {
    pub amount: u32,
}
