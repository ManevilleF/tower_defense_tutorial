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

/// tile marker component part of enemy path
#[derive(Debug, Component)]
pub struct Path;

/// Enemy spawner tile component
#[derive(Debug, Component)]
pub struct Spawner {
    pub amount: u32,
}

/// Enemy path component associated to spawner tiles
#[derive(Debug, Component, Deref, Default)]
pub struct EnemyPath(pub Vec<Hex>);
