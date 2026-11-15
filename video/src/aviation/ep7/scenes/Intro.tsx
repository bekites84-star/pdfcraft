import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useGrow, Stage } from "../../lib/common";
import { Helicopter, SKID_HEIGHT } from "../../lib/Helicopter";
import { IntroTitle } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Downwash, Field, Helipad, spin } from "../world";

/** A rescue helicopter lifts off its pad and drifts backwards. */
export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const upAt = wordFrame(scene, "straight", 0, 40);
  const backAt = wordFrame(scene, "backwards", 0, 120);
  const h = interpolate(frame, [upAt - 10, upAt + 45], [0, 3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const back = interpolate(frame, [backAt - 5, backAt + 40], [0, -2.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const y = SKID_HEIGHT + h + Math.sin(t * 1.6) * 0.06 * (h / 3);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [7, 4.5, 13], fov: 42 }} lookAt={[0, 4.4, 0]}>
        <Field />
        <Helipad />
        <Downwash position={[back, 0, 0]} strength={1 - h / 6} />
        <group position={[back, y, 0]} rotation={[0, 0.5, back * -0.04]}>
          <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} tilt={[back < -0.1 && back > -2.1 ? -0.08 : 0, 0]} />
        </group>
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={7} title="How Do Helicopters Fly?" subtitle="Straight up, sideways and backwards 🚁" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
