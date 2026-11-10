// Renders every episode thumbnail (1280×720 PNG) into out/thumbnails/.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("out/thumbnails", { recursive: true });
for (let n = 1; n <= 7; n++) {
  execFileSync("npx", ["remotion", "still", `Thumb-Ep${n}`, `out/thumbnails/ep${n}-thumbnail.png`, "--frame=0"], { stdio: "inherit" });
}
