import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { Stage, SUNSET, useGrow } from "../../lib/common";
import { Checklist, Ground } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const STEPS: [string, string][] = [
  ["glide", "Glide down"],
  ["flaps", "Flaps out"],
  ["gear", "Gear down"],
  ["flare", "Flare"],
  ["stop", "Stop!"],
];

export const Outro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = STEPS.map(([w], i) => useGrow(wordFrame(scene, w, 0, 20 + i * 25), 200));
  const thanks = useGrow(wordFrame(scene, "see", 0, 150), 12);
  const x = 40 + (frame / fps) * 0.8;
  return (
    <AbsoluteFill>
      <Stage background={SUNSET} camera={{ position: [x - 1, 2.4, 13] }} lookAt={[x - 7.5, 1.6, 0]}>
        <Ground />
        <group position={[x, GEAR_HEIGHT, 0]} rotation={[0, 0.5, 0]}>
          <Airplane gear={1} cabinGlow={0.8} fan={frame / fps} />
        </group>
      </Stage>
      <Checklist items={STEPS.map(([, label]) => label)} shown={shown} footer="See you on the next flight! 🛬" footerShown={thanks} />
    </AbsoluteFill>
  );
};
