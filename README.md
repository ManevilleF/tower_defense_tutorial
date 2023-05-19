# Tower defense tutorial


## Run

### Native run

use `cargo run --release` to launch the app in native. Use the `debug` feature for debug inspector.

### WASM build

* Native: `cargo serve --release` and open `http://127.0.0.1:1334`
* Browser: `./build_wasm.sh` and open `docs/wasm/index.html` in a browser

> Some browser might prevent local files to be loaded, in firefox setting `security.fileuri.strict_origin_policy` might be needed

## Play

### Board interaction

Use the *left* mouse button to toggle tiles, and the *right* mouse button to place towers.

You can also regenerate the board by pressing `R`.
