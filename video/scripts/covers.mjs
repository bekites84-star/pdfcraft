// Embeds each episode's thumbnail as the MP4's cover art (shown by phones, players and file
// browsers). Run after rendering: npm run covers. Uses the FFmpeg that ships with Remotion.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, renameSync } from "node:fs";
import { join } from "node:path";

for (const file of readdirSync("out").filter((f) => /^ep\d+-.*\.mp4$/.test(f))) {
  const n = file.match(/^ep(\d+)-/)?.[1];
  const cover = join("out", "thumbnails", `ep${n}-thumbnail.png`);
  if (!existsSync(cover)) {
    console.log(`skip ${file}: no ${cover} (run npm run thumbnails first)`);
    continue;
  }
  const src = join("out", file);
  const tmp = join("out", `.${file}.tmp.mp4`);
  execFileSync(
    "npx",
    ["remotion", "ffmpeg", "-y", "-loglevel", "error", "-i", src, "-i", cover, "-map", "0:v:0", "-map", "0:a?", "-map", "1", "-c", "copy", "-disposition:v:1", "attached_pic", "-movflags", "+faststart", tmp],
    { stdio: "inherit" },
  );
  renameSync(tmp, src);
  console.log(`cover art → ${src}`);
}
