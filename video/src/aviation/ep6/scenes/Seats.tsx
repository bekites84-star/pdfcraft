import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Cockpit } from "../cockpit";

/** From behind the seats: captain on the left, first officer on the right. */
export const Seats: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const capAt = wordFrame(scene, "captain", 0, 40);
  const foAt = wordFrame(scene, "officer", 0, 100);
  const shareAt = wordFrame(scene, "share", 0, 200);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-2.5, 2.0, 0], fov: 50 }} lookAt={[0.8, 1.0, 0]}>
        <Cockpit pilots />
        <Label3D position={[-0.68, 1.85, -0.62]} text="CAPTAIN" background="#b38600" opacity={ramp(frame, capAt, capAt + 10)} height={0.13} />
        <Label3D position={[-0.68, 1.85, 0.62]} text="FIRST OFFICER" background="#2f7cf6" opacity={ramp(frame, foAt, foAt + 10)} height={0.13} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, shareAt - 5, shareAt + 10)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>TEAMWORK</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#0d2340" }}>One flies, one checks 🤝</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#b38600", marginTop: 6 }}>Captain: 4 stripes · First officer: 3</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
