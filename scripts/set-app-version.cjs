const fs = require("fs");

const v = process.env.VERSION;
if (!v) {
  console.error("VERSION environment variable is required");
  process.exit(1);
}

// 1. tauri.conf.json
const tauriPath = "src-tauri/tauri.conf.json";
const tauri = JSON.parse(fs.readFileSync(tauriPath, "utf8"));
tauri.version = v;
fs.writeFileSync(tauriPath, JSON.stringify(tauri, null, 2));

// 2. Cargo.toml
const cargoPath = "src-tauri/Cargo.toml";
let cargo = fs.readFileSync(cargoPath, "utf8");
cargo = cargo.replace(/^version\s*=\s*"[^"]+"/m, `version = "${v}"`);
fs.writeFileSync(cargoPath, cargo);

// 3. package.json
const pkgPath = "package.json";
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = v;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
