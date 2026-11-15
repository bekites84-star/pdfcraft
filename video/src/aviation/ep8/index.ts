import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Bang } from "./scenes/Bang";
import { Blow } from "./scenes/Blow";
import { Bypass } from "./scenes/Bypass";
import { Inside } from "./scenes/Inside";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Squeeze } from "./scenes/Squeeze";
import { Suck } from "./scenes/Suck";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  inside: { component: Inside, chip: true },
  suck: { component: Suck, chip: true },
  squeeze: { component: Squeeze, chip: true },
  bang: { component: Bang, chip: true },
  blow: { component: Blow, chip: true },
  bypass: { component: Bypass, chip: true },
  outro: { component: Outro, chip: false },
});
