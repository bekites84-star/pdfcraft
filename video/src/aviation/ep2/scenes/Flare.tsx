import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { Ground, SmokePuff, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const SPEED = 7;
const SINK = 0.9; // units per second before the flare

/** Side view: steady descent, the nose comes up (flare), soft touchdown with tyre smoke. */
export const Flare: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const flareAt = wordFrame(scene, "raises", 0, 60);
  const touchAt = Math.max(flareAt + 30, wordFrame(scene, "touch", 0, 200));
  const T = (touchAt - flareAt) / fps;
  const h1 = (SINK * T) / 2; // height when the flare starts, so the sink rate is continuous
  const h =
    frame < flareAt ? h1 + SINK * ((flareAt - frame) / fps) : frame < touchAt ? h1 * Math.pow((touchAt - frame) / (touchAt - flareAt), 2) : 0;
  const pitch =
    frame < flareAt
      ? -0.02
      : frame < touchAt
        ? interpolate(frame, [flareAt, flareAt + 25], [-0.02, 0.1], { extrapolateRight: "clamp" })
        : interpolate(frame, [touchAt, touchAt + 40], [0.1, 0], { extrapolateRight: "clamp" });
  const x = SPEED * t;
  const y = GEAR_HEIGHT + h;
  const flareLabel = ramp(frame, wordFrame(scene, "flare", 0, flareAt + 30), wordFrame(scene, "flare", 0, flareAt + 30) + 10);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 1, 2.4 + h * 0.4, 14] }} lookAt={[x + 1, 1.4 + h * 0.6, 0]}>
        <CloudField speed={0.3} count={8} seed="ep2-flare" y={[6, 12]} z={[-60, -30]} spread={140} />
        <Ground />
        <group position={[x, y, 0]} rotation={[0, 0, pitch]}>
          <Airplane fan={t * 10} gear={1} flaps={1} />
        </group>
        <SmokePuff at={touchAt} position={[SPEED * (touchAt / fps) - 0.4, 0, 0.6]} drift={1.5} />
        <SmokePuff at={touchAt} position={[SPEED * (touchAt / fps) - 0.4, 0, -0.6]} drift={1.5} />
        <Label3D position={[x + 2.5, y + 1.7, 0]} text="FLARE: nose up" background="#f59e0b" opacity={flareLabel * (frame < touchAt + 30 ? 1 : 0)} height={0.6} />
        <Label3D position={[SPEED * (touchAt / fps), 1.6, 1]} text="soft touchdown!" background="#22b35e" opacity={ramp(frame, touchAt, touchAt + 10)} height={0.6} />
      </Stage>
    </AbsoluteFill>
  );
};
