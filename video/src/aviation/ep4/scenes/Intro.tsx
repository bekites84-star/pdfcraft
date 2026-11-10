import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Stage, useGrow } from "../../lib/common";
import { IntroTitle } from "../../lib/props";
import type { SceneTimeline } from "../../lib/timeline";
import { Hills, Patchwork, River } from "../map";

/** High above a patchwork of fields: no roads in the sky. */
export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = frame / scene.durationInFrames;
  const x = interpolate(k, [0, 1], [-5, 5]);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 9, 10, 14] }} lookAt={[x + 2, 2.2, 0]}>
        <group position={[0, -8, 0]}>
          <Patchwork size={[90, 60]} cell={5} seed="ep4-intro" />
          <River from={-45} to={45} z0={-6} />
          <Hills spots={[[-20, -18, 4], [14, -22, 5], [30, -15, 3.5]]} />
        </group>
        {[-14, -4, 8, 16].map((cx, i) => (
          <Cloud key={i} seed={60 + i} position={[cx, -2.5 - (i % 2), -6 + i * 2]} scale={1.3} opacity={0.9} />
        ))}
        <group position={[x, 0, 0]} rotation={[0, -0.25, 0]}>
          <Airplane fan={t * 25} />
        </group>
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={4} title="How Do Pilots Find Their Way?" subtitle="Maps, satellites and invisible roads 🧭" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
