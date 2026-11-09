import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, useGrow } from "../../lib/common";
import { IntroTitle } from "../../lib/props";
import type { SceneTimeline } from "../../lib/timeline";

export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = frame / scene.durationInFrames;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0, -0.5, 15] }} lookAt={[0, 0, 0]}>
        <CloudField speed={2.5} count={14} seed="ep2-intro" y={[-7, 3]} />
        <group position={[interpolate(k, [0, 1], [-5, 4]), interpolate(k, [0, 1], [-0.6, -2.8]), 0]} rotation={[0.1, -0.5, -0.06]}>
          <Airplane fan={t * 20} />
        </group>
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={2} title="How Do Airplanes Land?" subtitle="From the sky to a full stop 🛬" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
