use std::ops::RangeInclusive;

use bevy::{log, prelude::*, utils::HashMap};
use hexx::{algorithms::a_star, Hex};
use rand::RngCore;

#[derive(Debug)]
pub struct BuildingConfig {
    pub range: RangeInclusive<u32>,
    pub damage: u8,
}

#[derive(Debug, Resource)]
pub struct BoardConfig {
    pub map_radius: u32,
    pub enemy_spawn_tick: f32,
    pub max_enemy_speed: f32,
    pub base_enemy_health: RangeInclusive<u8>,
    pub difficulty: i32,
    pub rng_seed: [u8; 32],
    pub buildings: Vec<BuildingConfig>,
}

#[derive(Debug, Resource)]
pub struct HexBoard {
    pub entity: Entity,
    pub tile_entities: HashMap<Hex, Entity>,
}

#[derive(Debug, Resource)]
pub struct BoardState {
    pub money: u32,
    pub wave: u8,
}

impl Default for BoardConfig {
    fn default() -> Self {
        let mut rng_seed = [0; 32];
        rand::thread_rng().fill_bytes(&mut rng_seed);
        Self {
            map_radius: 30,
            base_enemy_health: 30..=100,
            enemy_spawn_tick: 1.0,
            rng_seed,
            difficulty: 1,
            max_enemy_speed: 0.5,
            buildings: vec![
                BuildingConfig {
                    range: 0..=5,
                    damage: 5,
                },
                BuildingConfig {
                    range: 3..=5,
                    damage: 10,
                },
                BuildingConfig {
                    range: 0..=3,
                    damage: 15,
                },
            ],
        }
    }
}

impl BoardConfig {
    pub fn difficulty(&self) -> f64 {
        self.difficulty.abs().max(1) as f64 + 2.0
    }
}

impl HexBoard {
    pub const DEFAULT_SCALE: Vec3 = Vec3::splat(1.0);
    pub const PATH_SCALE: Vec3 = Vec3::splat(0.8);

    pub fn shortest_path(
        &self,
        start: Hex,
        end: Hex,
        cost: impl Fn(&Entity) -> Option<u32> + Copy,
    ) -> Vec<Hex> {
        log::debug!("Computing path between {start:?} and {end:?} ...");
        let path = a_star(start, end, |h| self.tile_entities.get(&h).and_then(cost)).unwrap();
        log::debug!("... Done");
        path
    }
}
