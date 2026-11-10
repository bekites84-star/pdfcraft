import { Composition } from "remotion";
import { Main, mainSchemaDefaults, type MainProps } from "./Main";
import type { EpisodeProps } from "./aviation/lib/Episode";
import { FPS as AVIATION_FPS, loadTimeline, totalFrames, type Narration } from "./aviation/lib/timeline";
import * as ep1 from "./aviation/ep1";
import * as ep2 from "./aviation/ep2";
import * as ep3 from "./aviation/ep3";
import * as ep4 from "./aviation/ep4";
import * as ep5 from "./aviation/ep5";
import * as ep6 from "./aviation/ep6";
import * as ep7 from "./aviation/ep7";
import { Turntable } from "./aviation/lib/Turntable";

export const FPS = 30;

/** "Flying Made Simple" episodes: composition id → episode module. */
const EPISODES: { id: string; narration: Narration; Episode: React.FC<EpisodeProps> }[] = [
  { id: "Ep1-HowPlanesFly", ...ep1 },
  { id: "Ep2-HowPlanesLand", ...ep2 },
  { id: "Ep3-WhyFlySoHigh", ...ep3 },
  { id: "Ep4-HowPilotsNavigate", ...ep4 },
  { id: "Ep5-WhatIsTurbulence", ...ep5 },
  { id: "Ep6-InsideTheCockpit", ...ep6 },
  { id: "Ep7-HowHelicoptersFly", ...ep7 },
];

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {EPISODES.map(({ id, narration, Episode }) => (
        <Composition
          key={id}
          id={id}
          component={Episode}
          fps={AVIATION_FPS}
          width={1920}
          height={1080}
          durationInFrames={AVIATION_FPS * 60}
          defaultProps={{ timeline: [] } satisfies EpisodeProps}
          calculateMetadata={async () => {
            const timeline = await loadTimeline(narration);
            return { durationInFrames: totalFrames(timeline), props: { timeline } };
          }}
        />
      ))}
      <Composition id="AirplaneTurntable" component={Turntable} fps={30} width={1920} height={1080} durationInFrames={30 * 10} />
      <Composition
        id="Main"
        component={Main}
        durationInFrames={FPS * 8}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={mainSchemaDefaults satisfies MainProps}
      />
    </>
  );
};
