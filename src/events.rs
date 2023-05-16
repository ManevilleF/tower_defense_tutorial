use hexx::Hex;

#[derive(Debug)]
pub struct ComputePaths;

#[derive(Debug)]
pub struct ToggleBuilding {
    pub coord: Hex,
}

#[derive(Debug)]
pub struct ToggleTile {
    pub coord: Hex,
}
