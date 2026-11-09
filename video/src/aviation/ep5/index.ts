import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Causes } from "./scenes/Causes";
import { ClearAir } from "./scenes/ClearAir";
import { Feel } from "./scenes/Feel";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Radar } from "./scenes/Radar";
import { River } from "./scenes/River";
import { Strong } from "./scenes/Strong";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  feel: { component: Feel, chip: true },
  river: { component: River, chip: true },
  causes: { component: Causes, chip: true },
  clearair: { component: ClearAir, chip: true },
  strong: { component: Strong, chip: true },
  radar: { component: Radar, chip: true },
  outro: { component: Outro, chip: false },
});
