// Generates the AI voice-over for a narration file and writes a timing manifest.
//
//   node scripts/voice.mjs [--episode ep1|ep2|ep3] [--engine kokoro|espeak] [--voice NAME]
//                          [--narration path/to/narration.json] [--out public/voice/<narration id>]
//
// kokoro (default): Kokoro-82M neural voice (Apache-2.0) via kokoro-js. Downloads the model
//   from Hugging Face on first use (~90 MB, cached). Voices: af_heart, af_bella, am_michael, bf_emma, ...
// espeak: offline fallback using espeak-ng (+ MBROLA if installed). Robotic, but needs no download.
//
// Output: <out>/<sceneId>.wav and <out>/manifest.json with each scene's duration and
// per-word timings (estimated by spreading words over the clip by length) for captions.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Node's fetch ignores HTTPS_PROXY unless NODE_USE_ENV_PROXY is set; re-run with it behind a proxy.
if ((process.env.HTTPS_PROXY || process.env.https_proxy) && !process.env.NODE_USE_ENV_PROXY) {
  const r = spawnSync(process.execPath, ["--no-warnings", ...process.argv.slice(1)], {
    stdio: "inherit",
    env: { ...process.env, NODE_USE_ENV_PROXY: "1" },
  });
  process.exit(r.status ?? 1);
}

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith("--") ? [...acc, [a.slice(2), all[i + 1]]] : acc), []),
);
const engine = args.engine ?? "kokoro";
const narrationPath = args.narration ?? `src/aviation/${args.episode ?? "ep1"}/narration.json`;
const narration = JSON.parse(readFileSync(narrationPath, "utf8"));
const outDir = args.out ?? `public/voice/${narration.id}`;
mkdirSync(outDir, { recursive: true });

/** Duration in ms of a PCM WAV file, read from its header chunks. */
function wavDurationMs(path) {
  const b = readFileSync(path);
  let pos = 12;
  let byteRate = 0;
  while (pos + 8 <= b.length) {
    const id = b.toString("ascii", pos, pos + 4);
    let size = b.readUInt32LE(pos + 4);
    if (id === "fmt ") byteRate = b.readUInt32LE(pos + 16);
    if (id === "data") {
      // espeak writes a streaming header with an unknown (0 / 0xFFFFFFFF) data size.
      if (size === 0 || size === 0xffffffff || pos + 8 + size > b.length) size = b.length - pos - 8;
      return byteRate > 0 ? (size / byteRate) * 1000 : 0;
    }
    pos += 8 + size + (size % 2);
  }
  throw new Error(`No data chunk in ${path}`);
}

/** Spreads the words over the clip in proportion to their length (plus a little per word). */
function estimateWords(text, durationMs) {
  const words = text.split(/\s+/).filter(Boolean);
  const weight = (w) => w.replace(/[^\p{L}\p{N}]/gu, "").length + 2 + (/[.!?]$/.test(w) ? 4 : /[,;:]$/.test(w) ? 2 : 0);
  const total = words.reduce((s, w) => s + weight(w), 0);
  let t = 0;
  return words.map((w) => {
    const d = (weight(w) / total) * durationMs;
    const word = { text: w, startMs: Math.round(t), endMs: Math.round(t + d) };
    t += d;
    return word;
  });
}

let speak;
if (engine === "kokoro") {
  const { KokoroTTS } = await import("kokoro-js");
  const voice = args.voice ?? "af_heart";
  let tts;
  try {
    tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "q8", device: "cpu" });
  } catch (e) {
    console.error(`Could not load the Kokoro model (needs huggingface.co the first time): ${String(e?.message ?? e).slice(0, 200)}`);
    console.error("Use the offline voice instead: npm run voice -- --engine espeak");
    process.exit(1);
  }
  speak = async (text, file) => (await tts.generate(text, { voice, speed: 0.95 })).save(file);
} else if (engine === "espeak") {
  const voice = args.voice ?? "mb-us2";
  speak = async (text, file) => execFileSync("espeak-ng", ["-v", voice, "-s", "145", "-g", "4", "-a", "60", "-w", file, text], { stdio: "ignore" });
} else {
  throw new Error(`Unknown engine ${engine}`);
}

const scenes = [];
for (const scene of narration.scenes) {
  const file = join(outDir, `${scene.id}.wav`);
  process.stdout.write(`${scene.id}… `);
  await speak(scene.text, file);
  const durationMs = Math.round(wavDurationMs(file));
  console.log(`${(durationMs / 1000).toFixed(1)} s`);
  scenes.push({ id: scene.id, file: file.replace(/^public\//, ""), durationMs, words: estimateWords(scene.text, durationMs) });
}
writeFileSync(join(outDir, "manifest.json"), JSON.stringify({ engine, scenes }, null, 2));
console.log(`Wrote ${join(outDir, "manifest.json")}`);
