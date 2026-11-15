import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, SUNSET, useGrow } from "../../lib/common";
import { Checklist } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const POINTS: [string, string][] = [
  ["thin", "Thin air"],
  ["drag", "Less drag"],
  ["fuel", "Less fuel"],
  ["smoother", "Smoother rides"],
  ["safety", "Lots of safety"],
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
        <CloudField speed={1.5} count={12} seed="ep3-outro" y={[-7, -3]} />
        <group position={[6 + t * 0.3, 1.2, 0]} rotation={[0, -0.6, 0]} scale={0.9}>
          <Airplane fan={t * 30} cabinGlow={0.8} />
        </group>
      </Stage>
      <Checklist items={POINTS.map(([, label]) => label)} shown={shown} footer="See you on the next flight! ✈️" footerShown={thanks} />
    </AbsoluteFill>
  );
};
