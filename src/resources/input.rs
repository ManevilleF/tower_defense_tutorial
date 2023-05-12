use bevy::prelude::*;

#[derive(Debug, Default, Resource)]
pub enum InputState {
    #[default]
    ToggleBlocked,
    Build,
}
