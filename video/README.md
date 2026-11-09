# video/: 3D animated videos

A self-contained [Remotion](https://www.remotion.dev) project for making 3D animated videos:

| Part | Library | Where |
|---|---|---|
| 3D scenes and animation | [Three.js](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs) (+ [drei](https://drei.docs.pmnd.rs) helpers), embedded with [`@remotion/three`](https://www.remotion.dev/docs/three) | `src/scene/` |
| Captions | [`@remotion/captions`](https://www.remotion.dev/docs/captions) (word-by-word highlighted captions) | `src/captions/`, `public/captions/` |
| Audio | Remotion `<Audio>`, plus [`@remotion/media-utils`](https://www.remotion.dev/docs/media-utils) for audio-reactive visuals | `src/Main.tsx` |
| Rendering to MP4 | Remotion CLI (headless Chrome + bundled FFmpeg) | `npm run render` |

This folder is not part of the Rust workspace and is not shipped with PdfCraft.

## Setup

Requires Node.js 18 or newer.

```sh
cd video
npm install
```

## Use

```sh
npm run studio      # live preview editor at http://localhost:3000
npm run render      # renders out/main.mp4 (1920×1080, 30 fps, 8 s)
npm run still       # renders one frame to out/still.png
npm run typecheck
```

The first render downloads Remotion's headless Chrome. Without internet access, or to use a browser you already have, set `REMOTION_BROWSER=/path/to/chrome-headless-shell`. On a machine without a GPU, set `REMOTION_GL=swangle` (software WebGL) so Three.js renders.

## Series: "Flying Made Simple"

Short 3D explainers that teach aviation simply, each about 75 seconds long with an AI voice-over and captions.

| # | Episode | Composition | Source |
|---|---|---|---|
| 1 | How Do Airplanes Fly? (four forces, lift, thrust, takeoff, steering) | `Ep1-HowPlanesFly` | `src/aviation/ep1/` |
| 2 | How Do Airplanes Land? (descent, flaps, 3° glide slope, flare, braking) | `Ep2-HowPlanesLand` | `src/aviation/ep2/` |
| 3 | Why Do Planes Fly So High? (thin air, drag, fuel, weather, safety, cabin) | `Ep3-WhyFlySoHigh` | `src/aviation/ep3/` |

Shared parts live in `src/aviation/lib/`: the airliner model with moving ailerons, elevators, rudder, flaps, spoilers, gear, brakes and cabin lights, plus the sky, clouds, runway, mountains, arrows, labels, captions, the episode timeline and the cards.

```sh
npm run voice:all                          # AI voice-over for every episode (Kokoro, downloads ~90 MB once)
npm run voice -- --episode ep2             # one episode
npm run voice -- --episode ep2 --voice am_michael   # another voice: af_heart, af_bella, am_michael, bf_emma, bm_george, ...
npm run voice -- --episode ep2 --engine espeak      # offline robotic fallback (needs espeak-ng)
npm run render:ep1                         # out/ep1-how-planes-fly.mp4 (also render:ep2, render:ep3)
```

Each episode's words are in its `narration.json`. The voice step writes `public/voice/<episode id>/` (WAV files plus `manifest.json` with timings). Scene lengths, captions and on-screen cues such as arrows and labels appearing when a word is spoken all follow that manifest. To change the script, edit the JSON, run the voice step and re-render.

**Adding an episode:** copy `src/aviation/ep3/` to `ep4/` and give it a new `id`, `episode` number and scenes in `narration.json`. Write one component per scene id, list them in `index.ts`, and add the episode to `EPISODES` in `src/Root.tsx`. Then add `render:ep4` to `package.json`.

## Making your own video

- **3D**: edit `src/scene/Scene.tsx`. Drive every animation from `useCurrentFrame()` (with `interpolate`/`spring`), never from `useFrame` or clocks, so each frame renders the same way every time. Load models with drei's `useGLTF(staticFile("model.glb"))`.
- **Length and size**: `durationInFrames`, `fps`, `width`, `height` in `src/Root.tsx`.
- **Audio**: put a file in `public/` (e.g. `public/voiceover.mp3`) and set `audioFile: "voiceover.mp3"` in `src/Main.tsx`, or pass it per render:
  `npx remotion render Main out/v.mp4 --props='{"audioFile":"voiceover.mp3","captionsFile":"captions/example.json"}'`
- **Captions**: a JSON array of Remotion `Caption` objects (`text`, `startMs`, `endMs`, `timestampMs`, `confidence`); see `public/captions/example.json`. To generate them from a voice-over automatically, add [`@remotion/install-whisper-cpp`](https://www.remotion.dev/docs/install-whisper-cpp) (local Whisper transcription) and convert its output with `toCaptions()`.

Media files in `public/` (audio, images, video, 3D models) are gitignored on purpose: the repository only accepts assets with an `ATTRIBUTION.toml` entry (`AGENTS.md` §1).

## Licence note

Remotion is free for individuals and companies with up to 3 employees; larger companies need a [company licence](https://www.remotion.dev/license). Three.js, React Three Fiber and drei are MIT.
