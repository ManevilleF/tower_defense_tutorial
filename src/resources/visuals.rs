use bevy::{
    prelude::*,
    render::{mesh::Indices, render_resource::PrimitiveTopology},
};
use hexx::{ColumnMeshBuilder, Hex, MeshInfo};

use super::hex::HexConfig;

pub const COLUMN_HEIGHT: f32 = 5.0;

#[derive(Debug, Resource, Reflect)]
pub struct ColumnVisuals {
    pub mesh: Handle<Mesh>,
    pub spawner_mat: Handle<StandardMaterial>,
    pub target_mat: Handle<StandardMaterial>,
    pub default_mat: Handle<StandardMaterial>,
    pub blocked_mat: Handle<StandardMaterial>,
    pub path_mat: Handle<StandardMaterial>,
}

#[derive(Debug, Resource, Reflect)]
pub struct InputVisuals {
    pub selector_mesh: Handle<Mesh>,
    pub selected_mat: Handle<StandardMaterial>,
}

impl FromWorld for ColumnVisuals {
    fn from_world(world: &mut World) -> Self {
        let hex_config = world.resource::<HexConfig>();
        let layout = hex_config.layout.clone(); // borrow checker issue
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let mesh_info = ColumnMeshBuilder::new(&layout, COLUMN_HEIGHT)
            .without_bottom_face()
            .with_offset(Vec3::NEG_Y * COLUMN_HEIGHT)
            .build();
        let mesh = meshes.add(compute_hex_mesh(mesh_info));
        let mut materials = world.resource_mut::<Assets<StandardMaterial>>();
        let spawner_mat = materials.add(Color::ORANGE_RED.into());
        let target_mat = materials.add(Color::CYAN.into());
        let default_mat = materials.add(Color::GREEN.into());
        let blocked_mat = materials.add(Color::GRAY.into());
        let path_mat = materials.add(Color::WHITE.into());
        Self {
            mesh,
            spawner_mat,
            target_mat,
            default_mat,
            blocked_mat,
            path_mat,
        }
    }
}

impl FromWorld for InputVisuals {
    fn from_world(world: &mut World) -> Self {
        let hex_config = world.resource::<HexConfig>();
        let mesh_info = MeshInfo::hexagonal_plane(&hex_config.layout, Hex::ZERO);
        let mut meshes = world.resource_mut::<Assets<Mesh>>();
        let selector_mesh = meshes.add(compute_hex_mesh(mesh_info));
        let mut materials = world.resource_mut::<Assets<StandardMaterial>>();
        let selected_mat = materials.add(StandardMaterial {
            base_color: Color::YELLOW.with_a(0.9),
            unlit: true,
            ..default()
        });
        Self {
            selected_mat,
            selector_mesh,
        }
    }
}

pub fn compute_hex_mesh(mesh_info: MeshInfo) -> Mesh {
    let mut mesh = Mesh::new(PrimitiveTopology::TriangleList);
    mesh.insert_attribute(Mesh::ATTRIBUTE_POSITION, mesh_info.vertices);
    mesh.insert_attribute(Mesh::ATTRIBUTE_NORMAL, mesh_info.normals);
    mesh.insert_attribute(Mesh::ATTRIBUTE_UV_0, mesh_info.uvs);
    mesh.set_indices(Some(Indices::U16(mesh_info.indices)));
    mesh
}
