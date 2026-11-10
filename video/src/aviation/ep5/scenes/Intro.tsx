import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, useGrow } from "../../lib/common";
import { IntroTitle } from "../../lib/props";
import type { SceneTimeline } from "../../lib/timeline";
import { bump } from "../shake";

/** A plane jolting through grey, bumpy clouds. */
export const Intro: React.FC<{ scene: SceneTimeline }> = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = Math.min(1, t / 1.5);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #5c7fa8 0%, #8fa9c4 55%, #c3cfdb 100%)" camera={{ position: [0, -0.6, 15] }} lookAt={[0, 0, 0]}>
        <CloudField speed={4} count={18} seed="ep5-intro" y={[-7, 3]} z={[-26, 4]} color="#d5dbe3" glow={0.15} />
        <group position={[0.5, -1.9 + bump(t) * 0.22 * k, 0]} rotation={[0.18 + bump(t, 3) * 0.05 * k, -0.55, bump(t, 7) * 0.04 * k]}>
          <Airplane fan={t * 30} wingFlex={bump(t, 5) * 0.025 * k} />
        </group>
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={5} title="What Is Turbulence?" subtitle="Why planes shake, and why it's okay 🌬️" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
