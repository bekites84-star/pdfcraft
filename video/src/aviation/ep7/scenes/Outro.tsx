import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CloudField, Stage, SUNSET, useGrow } from "../../lib/common";
import { Helicopter } from "../../lib/Helicopter";
import { Checklist } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { spin } from "../world";

const POINTS: [string, string][] = [
  ["spinning", "Spinning wings"],
  ["hovering", "Hovering"],
  ["collective", "Collective: up & down"],
  ["cyclic", "Cyclic: any direction"],
  ["tail", "Tail rotor"],
];

export const Outro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shown = POINTS.map(([w], i) => useGrow(wordFrame(scene, w, 0, 15 + i * 25), 200));
  const thanks = useGrow(wordFrame(scene, "see", 0, 150), 12);
  return (
    <AbsoluteFill>
      <Stage background={SUNSET} camera={{ position: [-3, 1, 16] }} lookAt={[3, 0, 0]}>
        <CloudField speed={1.5} count={12} seed="ep7-outro" y={[-7, -3]} />
        <group position={[6 + t * 0.2, 1 + Math.sin(t * 1.4) * 0.1, 0]} rotation={[0, -0.7, 0]} scale={0.9}>
          <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} tilt={[0.08, 0]} />
        </group>
      </Stage>
      <Checklist items={POINTS.map(([, label]) => label)} shown={shown} footer="See you on the next flight! 🚁" footerShown={thanks} />
    </AbsoluteFill>
  );
};
