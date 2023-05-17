use bevy::{log, prelude::*, utils::HashMap};
use hexx::{algorithms::a_star, Hex};
use rand::RngCore;

#[derive(Debug, Clone)]
pub struct BuildingConfig {
    pub range_min: u32,
    pub range_max: u32,
    pub damage: u8,
}

#[derive(Debug, Clone, Resource)]
pub struct BoardConfig {
    pub map_radius: u32,
    pub enemy_spawn_tick: f32,
    pub max_enemy_speed: f32,
    pub min_enemy_health: u8,
    pub max_enemy_health: u8,
    pub difficulty: i32,
    pub rng_seed: [u8; 32],
    pub buildings: Vec<BuildingConfig>,
}

#[derive(Debug, Resource, Default, Deref, DerefMut)]
pub struct CandidateBoardConfig(pub BoardConfig);

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

#[derive(Debug, Clone, Copy, Resource, Deref, DerefMut, Default)]
pub struct SelectedBuilding(pub usize);

impl Default for BoardConfig {
    fn default() -> Self {
        let mut rng_seed = [0; 32];
        rand::thread_rng().fill_bytes(&mut rng_seed);
        Self {
            map_radius: 30,
            min_enemy_health: 100,
            max_enemy_health: u8::MAX,
            enemy_spawn_tick: 1.0,
            rng_seed,
            difficulty: 1,
            max_enemy_speed: 2.0,
            buildings: vec![
                BuildingConfig {
                    range_min: 0,
                    range_max: 5,
                    damage: 2,
                },
                BuildingConfig {
                    range_min: 3,
                    range_max: 5,
                    damage: 5,
                },
                BuildingConfig {
                    range_min: 0,
                    range_max: 3,
                    damage: 10,
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
    pub const DEFAULT_SCALE: Vec3 = Vec3::splat(0.9);

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
