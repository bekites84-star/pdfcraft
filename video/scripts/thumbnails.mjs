// Renders every episode thumbnail:
//   out/thumbnails/epN-thumbnail.png  1280×720, to upload as the YouTube thumbnail
//   public/thumbnails/epN.png         1920×1080, used as each video's opening title card
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("out/thumbnails", { recursive: true });
mkdirSync("public/thumbnails", { recursive: true });
for (let n = 1; n <= 7; n++) {
  execFileSync("npx", ["remotion", "still", `Thumb-Ep${n}`, `out/thumbnails/ep${n}-thumbnail.png`, "--frame=0"], { stdio: "inherit" });
  execFileSync("npx", ["remotion", "still", `Thumb-Ep${n}`, `public/thumbnails/ep${n}.png`, "--frame=0", "--scale=1.5"], { stdio: "inherit" });
}
