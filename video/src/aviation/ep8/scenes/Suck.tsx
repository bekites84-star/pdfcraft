import { AbsoluteFill, useCurrentFrame } from "remotion";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { EngineStage, StepBadge } from "../common";

/** Looking into the intake: the big fan spins and air pours in. */
export const Suck: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const tonAt = wordFrame(scene, "ton", 0, 200);
  return (
    <AbsoluteFill>
      <EngineStage camera={[9.5, 1.6, 5.5]} lookAt={[2.6, 0, 0]} engine={{ highlight: { fan: true }, core: 1, bypass: 1 }} />
      <StepBadge n={1} word="SUCK" color="#2f7cf6" show={ramp(frame, 0, 12)} />
      <InfoCard corner="bl" show={ramp(frame, tonAt - 10, tonAt + 5)} style={{ bottom: 190 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>AT FULL POWER</div>
        <div style={{ fontSize: 46, fontWeight: 900, color: "#0d2340" }}>1+ ton of air every second 🌬️</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
