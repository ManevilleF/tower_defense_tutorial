use bevy::{log, prelude::*, utils::HashMap};
use hexx::{algorithms::a_star, Hex};
use rand::RngCore;

#[derive(Debug, Resource)]
pub struct BoardConfig {
    pub map_radius: u32,
    pub enemy_spawn_tick: f32,
    pub enemy_speed: f32,
    pub base_enemy_health: u8,
    pub difficulty: i32,
    pub rng_seed: [u8; 32],
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
            base_enemy_health: 10,
            enemy_spawn_tick: 1.0,
            rng_seed,
            difficulty: 1,
            enemy_speed: 1.0,
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
