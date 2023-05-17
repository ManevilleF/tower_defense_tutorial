use bevy::{
    prelude::*,
    render::{mesh::Indices, render_resource::PrimitiveTopology},
};
use hexx::{HexLayout, PlaneMeshBuilder};

use super::hex::{HexConfig, HEX_SIZE};

#[derive(Debug, Resource, Reflect)]
pub struct ColumnVisuals {
    pub mesh: Handle<Mesh>,
    pub spawner_mat: Handle<ColorMaterial>,
    pub target_mat: Handle<ColorMaterial>,
    pub default_mat: Handle<ColorMaterial>,
    pub blocked_mat: Handle<ColorMaterial>,
    pub path_mat: Handle<ColorMaterial>,
    pub damage_mats: [Handle<ColorMaterial>; 10],
}

#[derive(Debug, Resource, Reflect)]
pub struct InputVisuals {
    pub selector_mesh: Handle<Mesh>,
    pub selected_mat: Handle<ColorMaterial>,
}

#[derive(Debug, Resource, Reflect)]
pub struct EnemyVisuals {
    pub mesh: Handle<Mesh>,
    pub mat: Handle<ColorMaterial>,
}

#[derive(Debug, Resource, Reflect)]
pub struct BuildingVisuals {
    pub mesh: Handle<Mesh>,
    pub mats: Vec<Handle<ColorMaterial>>,
}

impl FromWorld for ColumnVisuals {
    fn from_world(world: &mut World) -> Self {
        let hex_config = world.resource::<HexConfig>();
        let mesh = compute_hex_mesh(&hex_config.layout);
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let mesh = meshes.add(mesh);
        let mut materials = world.resource_mut::<Assets<ColorMaterial>>();
        let spawner_mat = materials.add(Color::ORANGE_RED.into());
        let target_mat = materials.add(Color::BLUE.into());
        let default_mat = materials.add(Color::GREEN.into());
        let blocked_mat = materials.add(Color::GRAY.into());
        let path_mat = materials.add(Color::WHITE.into());
        let damage_mats = [
            Color::WHITE,
            Color::YELLOW,
            Color::GOLD,
            Color::ORANGE,
            Color::ORANGE_RED,
            Color::SALMON,
            Color::CRIMSON,
            Color::TOMATO,
            Color::RED,
            Color::BLACK,
        ]
        .map(|c| materials.add(c.into()));
        Self {
            mesh,
            spawner_mat,
            target_mat,
            default_mat,
            blocked_mat,
            path_mat,
            damage_mats,
        }
    }
}

impl FromWorld for InputVisuals {
    fn from_world(world: &mut World) -> Self {
        let hex_config = world.resource::<HexConfig>();
        let mesh = compute_hex_mesh(&hex_config.layout);
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let selector_mesh = meshes.add(mesh);
        let mut materials = world.resource_mut::<Assets<ColorMaterial>>();
        let selected_mat = materials.add(Color::YELLOW.with_a(0.9).into());
        Self {
            selected_mat,
            selector_mesh,
        }
    }
}

impl FromWorld for EnemyVisuals {
    fn from_world(world: &mut World) -> Self {
        let mesh = shape::Circle::new(HEX_SIZE * 0.9);
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let mesh = meshes.add(mesh.into());
        let mut materials = world.resource_mut::<Assets<ColorMaterial>>();
        let mat = materials.add(Color::BLACK.into());
        Self { mesh, mat }
    }
}

impl FromWorld for BuildingVisuals {
    fn from_world(world: &mut World) -> Self {
        let mesh = shape::Quad::new(Vec2::splat(HEX_SIZE * 0.9));
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let mesh = meshes.add(mesh.into());
        let mut materials = world.resource_mut::<Assets<ColorMaterial>>();
        let mats = vec![
            materials.add(Color::ORANGE.into()),
            materials.add(Color::ORANGE_RED.into()),
            materials.add(Color::BLUE.into()),
            materials.add(Color::ALICE_BLUE.into()),
        ];
        Self { mesh, mats }
    }
}

pub fn compute_hex_mesh(layout: &HexLayout) -> Mesh {
    let mesh_info = PlaneMeshBuilder::new(layout).facing(Vec3::Z).build();
    let mut mesh = Mesh::new(PrimitiveTopology::TriangleList);
    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, mesh_info.vertices);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, mesh_info.normals);
    mesh.insert_attribute(Mesh::ATTRIBUTE_UV_0, mesh_info.uvs);
    mesh.set_indices(Some(Indices::U16(mesh_info.indices)));
    mesh
}
