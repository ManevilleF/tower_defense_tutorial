use std::usize;

use hexx::Hex;

#[derive(Debug)]
pub struct ComputePaths;

#[derive(Debug)]
pub struct PlaceBuilding {
    pub coord: Hex,
    pub id: usize,
}

#[derive(Debug)]
pub struct ToggleTile {
    pub coord: Hex,
}
