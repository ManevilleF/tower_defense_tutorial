use bevy::{
    log,
    prelude::*,
    utils::{HashMap, HashSet},
};
use hexx::{algorithms::a_star, Hex};
use rand::RngCore;

#[derive(Debug, Resource)]
pub struct BoardConfig {
    pub map_radius: u32,
    pub waves: u8,
    pub wave_multiplier: u8,
    pub base_enemy_count: u8,
    pub base_money: u32,
    pub base_health: u8,
    pub difficulty: i32,
    pub rng_seed: [u8; 32],
}

#[derive(Debug, Resource)]
pub struct HexBoard {
    pub entity: Entity,
    pub tile_entities: HashMap<Hex, Entity>,
    pub blocked_tiles: HashSet<Hex>,
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
            waves: 10,
            base_money: 1_000,
            base_health: 10,
            wave_multiplier: 2,
            base_enemy_count: 2,
            rng_seed,
            difficulty: 1,
        }
    }
}

impl BoardConfig {
    pub fn enemy_count(&self, wave: u8) -> u32 {
        u32::from(self.base_enemy_count.max(1)) * u32::from(wave) * u32::from(self.wave_multiplier)
    }

    pub fn difficulty(&self) -> f64 {
        self.difficulty.abs().max(1) as f64 + 2.0
    }
}

impl HexBoard {
    pub const COLUMN_UNIT_HEIGHT: f32 = 1.0;

    pub fn shortest_path(&self, start: Hex, end: Hex) -> Vec<Hex> {
        log::debug!("Computing path between {start:?} and {end:?} ...");
        let path = a_star(start, end, |h| {
            self.tile_entities
                .contains_key(&h)
                .then_some(if self.blocked_tiles.contains(&h) {
                    100
                } else {
                    1
                })
        })
        .unwrap();
        log::debug!("... Done");
        path
    }
}
