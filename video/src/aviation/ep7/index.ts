import { makeEpisode } from "../lib/Episode";
import type { Narration } from "../lib/timeline";
import narrationJson from "./narration.json";
import { Anywhere } from "./scenes/Anywhere";
import { Collective } from "./scenes/Collective";
import { Cyclic } from "./scenes/Cyclic";
import { Hover } from "./scenes/Hover";
import { Intro } from "./scenes/Intro";
import { Outro } from "./scenes/Outro";
import { TailRotor } from "./scenes/TailRotor";
import { Wings } from "./scenes/Wings";

export const narration: Narration = narrationJson;

export const Episode = makeEpisode({
  intro: { component: Intro, chip: false },
  wings: { component: Wings, chip: true },
  hover: { component: Hover, chip: true },
  collective: { component: Collective, chip: true },
  cyclic: { component: Cyclic, chip: true },
  tail: { component: TailRotor, chip: true },
  anywhere: { component: Anywhere, chip: true },
  outro: { component: Outro, chip: false },
});
