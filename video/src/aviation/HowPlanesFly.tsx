import { fade } from "@remotion/transitions/fade";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TitleChip } from "./common";
import { SceneCaptions } from "./SceneCaptions";
import { Controls } from "./scenes/Controls";
import { Forces } from "./scenes/Forces";
import { Intro } from "./scenes/Intro";
import { Lift } from "./scenes/Lift";
import { Outro } from "./scenes/Outro";
import { Takeoff } from "./scenes/Takeoff";
import { Thrust } from "./scenes/Thrust";
import { LEAD_IN_FRAMES, TRANSITION_FRAMES, type SceneTimeline } from "./timeline";

const SCENES: Record<string, { component: React.FC<{ scene: SceneTimeline }>; chip: boolean }> = {
  intro: { component: Intro, chip: false },
  forces: { component: Forces, chip: true },
  lift: { component: Lift, chip: true },
  thrust: { component: Thrust, chip: true },
  takeoff: { component: Takeoff, chip: true },
  controls: { component: Controls, chip: true },
  outro: { component: Outro, chip: false },
};

export type HowPlanesFlyProps = { timeline: SceneTimeline[] };

export const HowPlanesFly: React.FC<HowPlanesFlyProps> = ({ timeline }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <TransitionSeries>
        {timeline.flatMap((scene, i) => {
          const entry = SCENES[scene.id];
          if (!entry) return [];
          const Scene = entry.component;
          const items = [
            <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
              <Scene scene={scene} />
              {entry.chip ? <TitleChip title={scene.title} /> : null}
              <SceneCaptions words={scene.words} />
              {scene.audio ? (
                <Sequence from={LEAD_IN_FRAMES} layout="none">
                  <Audio src={staticFile(scene.audio)} />
                </Sequence>
              ) : null}
            </TransitionSeries.Sequence>,
          ];
          if (i < timeline.length - 1) {
            items.push(
              <TransitionSeries.Transition key={`${scene.id}-t`} presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />,
            );
          }
          return items;
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
