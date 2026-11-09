import { staticFile } from "remotion";
import narration from "./narration.json";

export const FPS = 30;
/** Silence before the voice starts in each scene, and after it ends. */
export const LEAD_IN_FRAMES = 12;
export const TAIL_FRAMES = 24;
/** Cross-fade between scenes. */
export const TRANSITION_FRAMES = 12;

export type Word = { text: string; startMs: number; endMs: number };

export type SceneTimeline = {
  id: string;
  title: string;
  /** Audio file inside public/, or null when no voice has been generated. */
  audio: string | null;
  durationInFrames: number;
  words: Word[];
};

type Manifest = { scenes: { id: string; file: string; durationMs: number; words: Word[] }[] };

const MANIFEST = "voice/aviation/manifest.json";

/** Rough speaking-time estimate, used only when no voice-over has been generated yet. */
function estimateWords(text: string): { durationMs: number; words: Word[] } {
  const msPerWord = 380;
  const words = text.split(/\s+/).filter(Boolean).map((w, i) => ({ text: w, startMs: i * msPerWord, endMs: (i + 1) * msPerWord }));
  return { durationMs: words.length * msPerWord, words };
}

export async function loadTimeline(): Promise<SceneTimeline[]> {
  let manifest: Manifest | null = null;
  try {
    const res = await fetch(staticFile(MANIFEST));
    if (res.ok) manifest = (await res.json()) as Manifest;
  } catch {
    manifest = null;
  }
  return narration.scenes.map((scene) => {
    const voiced = manifest?.scenes.find((s) => s.id === scene.id);
    const { durationMs, words } = voiced ?? estimateWords(scene.text);
    return {
      id: scene.id,
      title: scene.title,
      audio: voiced ? voiced.file : null,
      words,
      durationInFrames: LEAD_IN_FRAMES + Math.ceil((durationMs / 1000) * FPS) + TAIL_FRAMES,
    };
  });
}

export function totalFrames(timeline: SceneTimeline[]): number {
  const sum = timeline.reduce((s, t) => s + t.durationInFrames, 0);
  return Math.max(1, sum - TRANSITION_FRAMES * Math.max(0, timeline.length - 1));
}

const norm = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Frame (relative to the scene start) at which the `nth` occurrence of `word` is spoken,
 * or `fallback` if the word isn't in the narration.
 */
export function wordFrame(scene: SceneTimeline, word: string, nth = 0, fallback = 0): number {
  const target = norm(word);
  const hits = scene.words.filter((w) => norm(w.text) === target);
  const hit = hits[nth];
  return hit ? LEAD_IN_FRAMES + Math.round((hit.startMs / 1000) * FPS) : fallback;
}
