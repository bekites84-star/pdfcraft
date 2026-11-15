import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Altitude } from "./scenes/Altitude";
import { Attitude } from "./scenes/Attitude";
import { Checklist } from "./scenes/Checklist";
import { Controls } from "./scenes/Controls";
import { Intro } from "./scenes/Intro";
import { MapScreen } from "./scenes/MapScreen";
import { Outro } from "./scenes/Outro";
import { Seats } from "./scenes/Seats";
import { Speed } from "./scenes/Speed";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  seats: { component: Seats, chip: true },
  speed: { component: Speed, chip: true },
  attitude: { component: Attitude, chip: true },
  altitude: { component: Altitude, chip: true },
  map: { component: MapScreen, chip: true },
  controls: { component: Controls, chip: true },
  checklist: { component: Checklist, chip: true },
  outro: { component: Outro, chip: false },
});
