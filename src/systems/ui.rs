use bevy::prelude::*;

use bevy_egui::{
    egui::{self, Color32, RichText},
    EguiContexts,
};

use crate::resources::board::CandidateBoardConfig;

pub fn show(
    mut commands: Commands,
    mut config: ResMut<CandidateBoardConfig>,
    mut contexts: EguiContexts,
) {
    egui::Window::new("Config")
        .default_size([0.0, 0.0])
        .resizable(false)
        .show(contexts.ctx_mut(), |ui| {
            ui.heading("Board");
            egui::Grid::new("Board grid").show(ui, |ui| {
                ui.label("Map radius");
                ui.add(egui::Slider::new(&mut config.map_radius, 5..=100));
                ui.end_row();
                ui.label("Difficulty");
                ui.add(egui::Slider::new(&mut config.difficulty, 1..=10));
                ui.end_row();
            });
            ui.add_space(10.0);
            ui.heading("Enemies");
            egui::Grid::new("Enemy grid").show(ui, |ui| {
                ui.label("Spawn tick");
                ui.add(egui::Slider::new(&mut config.enemy_spawn_tick, 0.1..=3.0));
                ui.end_row();
                ui.label("Max Speed");
                ui.add(egui::Slider::new(&mut config.max_enemy_speed, 0.1..=5.0));
                ui.end_row();

                let [min, max] = [config.min_enemy_health, config.max_enemy_health];
                ui.label("Min health");
                ui.add(egui::Slider::new(&mut config.min_enemy_health, 1..=max));
                ui.end_row();
                ui.label("Max health");
                ui.add(egui::Slider::new(
                    &mut config.max_enemy_health,
                    min..=u8::MAX,
                ));
                ui.end_row();
            });
            ui.add_space(10.0);
            ui.heading("Towers");
            let radius = config.map_radius;
            egui::Grid::new("Buildings grid").show(ui, |ui| {
                for (i, building) in config.buildings.iter_mut().enumerate() {
                    ui.label(RichText::new(format!("Tower {i}")).strong());
                    ui.end_row();
                    ui.label("Damage");
                    ui.add(egui::Slider::new(&mut building.damage, 1..=u8::MAX));
                    ui.end_row();

                    let [min, max] = [building.range_min, building.range_max];
                    ui.label("Min Range");
                    ui.add(egui::Slider::new(&mut building.range_min, 0..=max));
                    ui.end_row();
                    ui.label("Max Range");
                    ui.add(egui::Slider::new(&mut building.range_max, min..=radius));
                    ui.end_row();
                }
            });
            ui.add_space(10.0);

            ui.centered_and_justified(|ui| {
                if ui
                    .button(RichText::new("Generate Board").color(Color32::GREEN))
                    .clicked()
                {
                    commands.insert_resource(config.0.clone());
                }
            });
        });
}
