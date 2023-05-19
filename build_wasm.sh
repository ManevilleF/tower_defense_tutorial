# WASM target
rustup target add wasm32-unknown-unknown
# WASM Bindgen CLI
cargo install wasm-bindgen-cli
# Build the project
cargo build --release --target wasm32-unknown-unknown
# Setup target directory
mkdir public
# Move the index file
cp index.html docs/wasm
# Move the assets
cp -r assets docs/wasm 
# Bind the wasm build
wasm-bindgen --out-dir docs/wasm --target web target/wasm32-unknown-unknown/release/tower_defense.wasm
