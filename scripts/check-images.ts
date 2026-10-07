import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const tracked = new Set(
  execSync("git ls-files public", { encoding: "utf-8" })
    .split(/\r?\n/)
    .filter(Boolean)
    .map((f) => "/" + f.replace(/^public\//, ""))
);

function walk(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
    );
}

const re = /["'`](\/[^"'`\s]+\.(?:png|jpe?g|svg|webp|gif|avif))["'`]/gi;
let missing = 0;

for (const file of walk("src").filter((f) => /\.(tsx?|css)$/.test(f))) {
  const text = fs.readFileSync(file, "utf-8");
  for (const m of text.matchAll(re)) {
    if (!tracked.has(m[1])) {
      console.log(`MISSING ${m[1]}   (used in ${file})`);
      missing++;
    }
  }
}
console.log(missing ? `${missing} problem(s) found` : "All image paths are in Git");