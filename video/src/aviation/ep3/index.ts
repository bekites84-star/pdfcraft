import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Cabin } from "./scenes/Cabin";
import { FuelScene } from "./scenes/Fuel";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { Safety } from "./scenes/Safety";
import { ThinAir } from "./scenes/ThinAir";
import { Weather } from "./scenes/Weather";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  thinair: { component: ThinAir, chip: true },
  fuel: { component: FuelScene, chip: true },
  weather: { component: Weather, chip: true },
  safety: { component: Safety, chip: true },
  cabin: { component: Cabin, chip: true },
  outro: { component: Outro, chip: false },
});
