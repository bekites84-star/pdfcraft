import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Label3D } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { EngineStage } from "../common";

/** Most of the air goes around the core: the bypass stream lights up blue. */
export const Bypass: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const aroundAt = wordFrame(scene, "outside", 0, 160);
  const pushAt = wordFrame(scene, "push", 0, 230);
  const around = ramp(frame, aroundAt - 25, aroundAt);
  return (
    <AbsoluteFill>
      <EngineStage camera={[3, 3.4, 12]} lookAt={[0.4, 0, 0]} engine={{ core: 1 - 0.65 * around, bypass: 0.3 + 0.7 * around }}>
        <Label3D position={[-1, 2.35, 0]} text="around the outside" background="#2f7cf6" opacity={around} height={0.75} />
        <Label3D position={[-1, -1.25, 1]} text="through the middle" background="#f08a24" opacity={around} height={0.6} />
      </EngineStage>
      <InfoCard corner="tr" show={ramp(frame, pushAt - 10, pushAt + 5)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>WHERE THE PUSH COMES FROM</div>
        <div style={{ display: "flex", height: 54, borderRadius: 14, overflow: "hidden", marginTop: 10, width: 520, fontFamily: "system-ui", fontWeight: 900, fontSize: 30, color: "white" }}>
          <div style={{ width: "80%", background: "#2f7cf6", display: "flex", alignItems: "center", paddingLeft: 16 }}>fan air ~80%</div>
          <div style={{ width: "20%", background: "#f08a24", display: "flex", alignItems: "center", justifyContent: "center" }}>hot</div>
        </div>
      </InfoCard>
    </AbsoluteFill>
  );
};
