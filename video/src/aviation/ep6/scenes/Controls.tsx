import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Cockpit } from "../cockpit";

/** Over the captain's shoulder: the yoke turns, the throttles go forward, then the autopilot takes over. */
export const Controls: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const yokeAt = wordFrame(scene, "yoke", 0, 60);
  const thrAt = wordFrame(scene, "throttle", 0, 120);
  const apAt = wordFrame(scene, "autopilot", 0, 220);
  const yokeOn = ramp(frame, yokeAt - 20, yokeAt) * (1 - ramp(frame, apAt - 10, apAt + 10));
  const throttle = interpolate(frame, [thrAt - 10, thrAt + 25], [0.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ap = ramp(frame, apAt - 5, apAt + 10);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-1.05, 1.5, -0.15], fov: 55 }} lookAt={[0.45, 0.62, -0.42]}>
        <Cockpit yokeRoll={Math.sin(t * 2.4) * 0.5 * yokeOn} yokePush={Math.sin(t * 1.3) * yokeOn} throttle={throttle} autopilot={ap} />
        <Label3D position={[0.32, 0.98, -0.62]} text="yoke" background="#2f7cf6" opacity={ramp(frame, yokeAt, yokeAt + 10)} height={0.09} />
        <Label3D position={[0.05, 1.0, 0]} text="throttles" background="#f08a24" opacity={ramp(frame, thrAt, thrAt + 10)} height={0.09} />
      </Stage>
      <InfoCard corner="tr" show={ap}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>AUTOPILOT</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: "#22b35e" }}>ON ✓</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
