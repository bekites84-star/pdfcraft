import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label3D } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { BURN } from "../engine";
import { EngineStage, StepBadge } from "../common";

/** The combustion chamber: fuel sprays in and burns like a blowtorch. */
export const Bang: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const fuelAt = wordFrame(scene, "fuel", 0, 40);
  const lightAt = wordFrame(scene, "alight", 0, 90);
  const torchAt = wordFrame(scene, "blowtorch", 0, 220);
  const flame = ramp(frame, lightAt - 5, lightAt + 10);
  return (
    <AbsoluteFill>
      <EngineStage camera={[0.6, 1.1, 5.4]} lookAt={[0.05, 0, 0]} engine={{ highlight: { burner: frame < lightAt }, core: 1, bypass: 0.15, flame }}>
        <Label3D position={[BURN[0] + 0.2, 1.25, 0]} text="fuel sprayed in" background="#b38600" opacity={ramp(frame, fuelAt, fuelAt + 10)} height={0.32} />
      </EngineStage>
      <StepBadge n={3} word="BANG" color="#f08a24" show={ramp(frame, 0, 12)} />
      <InfoCard corner="bl" show={ramp(frame, torchAt - 10, torchAt + 5)} style={{ bottom: 190 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>NOT REALLY A BANG…</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#0d2340" }}>a steady flame, like a blowtorch 🔥</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
