import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FORCE_COLORS } from "../../lib/common";
import { Bar, InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { EngineStage, StepBadge } from "../common";

/** The compressor in yellow; the air bunches up and the pressure and heat bars rise. */
export const Squeeze: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const compAt = wordFrame(scene, "compressor", 0, 90);
  const hotAt = wordFrame(scene, "hot", 0, 230);
  const squeeze = ramp(frame, compAt - 10, compAt + 50);
  const heat = ramp(frame, hotAt - 15, hotAt + 10);
  return (
    <AbsoluteFill>
      <EngineStage camera={[2.4, 1.4, 7.2]} lookAt={[1.6, 0, 0]} engine={{ highlight: { compressor: frame >= compAt - 10 }, core: 1, bypass: 0.25 }} />
      <StepBadge n={2} word="SQUEEZE" color="#22b35e" show={ramp(frame, 0, 12)} />
      <InfoCard corner="bl" show={ramp(frame, compAt - 10, compAt + 5)} style={{ bottom: 190 }}>
        <Bar label="SQUASH" value={0.15 + squeeze * 1.05} color="#22b35e" />
        <Bar label="HEAT" value={0.1 + heat * 0.9 * squeeze} color={FORCE_COLORS.weight} />
      </InfoCard>
    </AbsoluteFill>
  );
};
