const fs = require("fs");

const bumpType = process.env.BUMP_TYPE || "patch";
const conf = JSON.parse(
  fs.readFileSync("src-tauri/tauri.conf.json", "utf8")
);
const parts = conf.version.split(".").map((s) => parseInt(s, 10) || 0);
while (parts.length < 3) parts.push(0);
let [m, n, p] = parts;

if (bumpType === "major") {
  m += 1;
  n = 0;
  p = 0;
} else if (bumpType === "minor") {
  n += 1;
  p = 0;
} else {
  p += 1;
}

const version = [m, n, p].join(".");
const outPath = process.env.GITHUB_OUTPUT;
if (outPath) {
  fs.appendFileSync(outPath, `version=${version}\n`);
}
