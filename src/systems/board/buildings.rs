use crate::{
    components::{Building, Coords, Damage, Health, TileType},
    events::PlaceBuilding,
    resources::{
        board::{BoardConfig, HexBoard},
        hex::HexConfig,
        visuals::BuildingVisuals,
    },
};
use bevy::prelude::*;
use bevy::{log, math::Vec3Swizzles};

const Z_POS: f32 = 20.0;

pub fn spawn(
    mut commands: Commands,
    board: Res<HexBoard>,
    visuals: Res<BuildingVisuals>,
    mut building_evr: EventReader<PlaceBuilding>,
    tiles: Query<&TileType, Without<Building>>,
) {
    for event in building_evr.iter() {
        let entity = board.tile_entities[&event.coord];
        let tile = match tiles.get(entity) {
            Ok(t) => *t,
            // We skip tiles with a building
            Err(_) => continue,
        };
        if tile != TileType::Mountain {
            log::warn!("Tile {:?} is not a mountain", event.coord);
            continue;
        }
        commands
            .entity(entity)
            .insert(Building(event.id))
            .with_children(|b| {
                b.spawn((
                    ColorMesh2dBundle {
                        mesh: visuals.mesh.clone().into(),
                        material: visuals.mats[event.id].clone(),
                        transform: Transform::from_xyz(0.0, 0.0, Z_POS),
                        ..default()
                    },
                    Name::new(format!("Building {}", event.id)),
                ));
            });
    }
}

pub fn place_damage(
    mut commands: Commands,
    config: Res<BoardConfig>,
    board: Res<HexBoard>,
    new_buildings: Query<(&Coords, &Building), Changed<Building>>,
    mut tiles: Query<(Entity, Option<&mut Damage>), With<Coords>>,
) {
    for (coord, building) in &new_buildings {
        let config = &config.buildings[building.0];
        let tile_entities = coord
            .0
            .spiral_range(config.range.clone())
            .filter_map(|c| board.tile_entities.get(&c).copied());
        let mut iter = tiles.iter_many_mut(tile_entities);
        while let Some((entity, damage)) = iter.fetch_next() {
            if let Some(mut damage) = damage {
                damage.0 += config.damage;
            } else {
                commands.entity(entity).insert(Damage(config.damage));
            }
        }
    }
}

pub fn handle_damage(
    hex_config: Res<HexConfig>,
    board: Res<HexBoard>,
    damage_tiles: Query<&Damage>,
    mut healths: Query<(&GlobalTransform, &mut Health)>,
) {
    for (transform, mut health) in &mut healths {
        let pos = transform.translation().xy();
        let coord = hex_config.layout.world_pos_to_hex(pos);
        let entity = board.tile_entities[&coord];
        if let Ok(damage) = damage_tiles.get(entity) {
            health.0 = health.0.saturating_sub(damage.0);
        }
    }
}
