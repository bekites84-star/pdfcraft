import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Controls } from "./scenes/Controls";
import { Forces } from "./scenes/Forces";
import { Intro } from "./scenes/Intro";
import { Lift } from "./scenes/Lift";
import { Outro } from "./scenes/Outro";
import { Takeoff } from "./scenes/Takeoff";
import { Thrust } from "./scenes/Thrust";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  forces: { component: Forces, chip: true },
  lift: { component: Lift, chip: true },
  thrust: { component: Thrust, chip: true },
  takeoff: { component: Takeoff, chip: true },
  controls: { component: Controls, chip: true },
  outro: { component: Outro, chip: false },
});
