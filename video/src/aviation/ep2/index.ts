import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Approach } from "./scenes/Approach";
import { Braking } from "./scenes/Braking";
import { Descent } from "./scenes/Descent";
import { Flaps } from "./scenes/Flaps";
import { Flare } from "./scenes/Flare";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  descent: { component: Descent, chip: true },
  flaps: { component: Flaps, chip: true },
  approach: { component: Approach, chip: true },
  flare: { component: Flare, chip: true },
  braking: { component: Braking, chip: true },
  outro: { component: Outro, chip: false },
});
