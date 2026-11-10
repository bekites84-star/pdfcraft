import { useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Arrow, CloudField, FORCE_COLORS, Stage, useGrow } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

export const Forces: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const lift = useGrow(wordFrame(scene, "lift", 0, 60));
  const weight = useGrow(wordFrame(scene, "weight", 0, 110));
  const thrust = useGrow(wordFrame(scene, "thrust", 0, 160));
  const drag = useGrow(wordFrame(scene, "drag", 0, 210));
  return (
    <Stage camera={{ position: [2.5, 2.4, 17] }} lookAt={[0, 0.4, 0]}>
      <CloudField speed={2.5} count={12} seed="forces" z={[-45, -22]} y={[-8, 8]} />
      <group position={[0, 0.7 + Math.sin(t * 1.3) * 0.12, 0]} rotation={[0, -0.3, 0]}>
        <Airplane fan={t * 30} />
        <Arrow origin={[0, 0.5, 0]} dir={[0, 1, 0]} length={3} color={FORCE_COLORS.lift} progress={lift} label="LIFT ↑" labelOffset={[0, 0.7, 0]} />
        <Arrow origin={[0, -0.7, 0]} dir={[0, -1, 0]} length={2.0} color={FORCE_COLORS.weight} progress={weight} label="WEIGHT ↓" labelOffset={[0, -0.7, 0]} />
        <Arrow origin={[3.4, 0, 0]} dir={[1, 0, 0]} length={2.6} color={FORCE_COLORS.thrust} progress={thrust} label="THRUST →" labelOffset={[0.2, 0.75, 0]} />
        <Arrow origin={[-3.8, 0.5, 0]} dir={[-1, 0, 0]} length={2.2} color={FORCE_COLORS.drag} progress={drag} label="← DRAG" labelOffset={[-0.2, 0.75, 0]} />
      </group>
    </Stage>
  );
};
