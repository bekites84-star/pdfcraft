import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Bags } from "./scenes/Bags";
import { Catering } from "./scenes/Catering";
import { Fuel } from "./scenes/Fuel";
import { Intro } from "./scenes/Intro";
import { Loading } from "./scenes/Loading";
import { Outro } from "./scenes/Outro";
import { Pushback } from "./scenes/Pushback";
import { TowerScene } from "./scenes/TowerScene";
import { Walkaround } from "./scenes/Walkaround";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  bags: { component: Bags, chip: true },
  loading: { component: Loading, chip: true },
  fuel: { component: Fuel, chip: true },
  catering: { component: Catering, chip: true },
  walkaround: { component: Walkaround, chip: true },
  pushback: { component: Pushback, chip: true },
  tower: { component: TowerScene, chip: true },
  outro: { component: Outro, chip: false },
});
