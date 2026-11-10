import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Atc } from "./scenes/Atc";
import { Autopilot } from "./scenes/Autopilot";
import { Beam } from "./scenes/Beam";
import { Gps } from "./scenes/Gps";
import { Intro } from "./scenes/Intro";
import { OldWays } from "./scenes/OldWays";
import { Outro } from "./scenes/Outro";
import { Plan } from "./scenes/Plan";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  oldways: { component: OldWays, chip: true },
  plan: { component: Plan, chip: true },
  gps: { component: Gps, chip: true },
  autopilot: { component: Autopilot, chip: true },
  atc: { component: Atc, chip: true },
  beam: { component: Beam, chip: true },
  outro: { component: Outro, chip: false },
});
