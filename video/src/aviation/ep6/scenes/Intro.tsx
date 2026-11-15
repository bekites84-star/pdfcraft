import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, useGrow } from "../../lib/common";
import { IntroTitle } from "../../lib/props";
import type { SceneTimeline } from "../../lib/timeline";

/** The camera glides up to the airliner's windshield. */
export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = interpolate(frame, [0, scene.durationInFrames], [0, 1], { easing: Easing.inOut(Easing.cubic) });
  const cam: [number, number, number] = [interpolate(k, [0, 1], [10, 5.2]), interpolate(k, [0, 1], [-0.5, 0.45]), interpolate(k, [0, 1], [9, 1.6])];
  return (
    <AbsoluteFill>
      <Stage camera={{ position: cam, fov: 40 }} lookAt={[interpolate(k, [0, 1], [0.5, 2.9]), interpolate(k, [0, 1], [1.2, 0.15]), 0]}>
        <CloudField speed={3} count={14} seed="ep6-intro" />
        <Airplane fan={t * 30} />
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={6} title="What's in the Cockpit?" subtitle="A tour of the pilots' office 👩‍✈️" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
