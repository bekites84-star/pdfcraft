import { fade } from "@remotion/transitions/fade";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { TitleChip } from "./common";
import { SceneCaptions } from "./SceneCaptions";
import { LEAD_IN_FRAMES, TRANSITION_FRAMES, type SceneTimeline } from "./timeline";

export type SceneComponent = React.FC<{ scene: SceneTimeline }>;
/** Scene id (as in narration.json) → its component, and whether to show the title chip. */
export type SceneRegistry = Record<string, { component: SceneComponent; chip: boolean }>;

export type EpisodeProps = { timeline: SceneTimeline[] };

/** Plays an episode's scenes in order with cross-fades, title chips, captions and voice-over. */
export const makeEpisode = (SCENES: SceneRegistry): React.FC<EpisodeProps> => {
  const Episode: React.FC<EpisodeProps> = ({ timeline }) => {
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
  return Episode;
};
