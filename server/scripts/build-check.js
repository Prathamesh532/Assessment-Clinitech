import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const roots = ["src", "scripts"];
const files = roots.flatMap((root) => fs.readdirSync(root, { recursive: true }).filter((file) => file.endsWith(".js")).map((file) => path.join(root, file)));
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Syntax checked ${files.length} JavaScript files`);
