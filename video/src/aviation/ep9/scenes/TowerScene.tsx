import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { Stage } from "../../lib/common";
import { Ground, InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Tower } from "../airport";

/** The plane lines up; the tower clears it; it rolls and lifts off. */
export const TowerScene: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const clearAt = Math.max(30, wordFrame(scene, "cleared", 0, 150));
  const roll = Math.max(0, (frame - clearAt) / fps);
  const taxi = interpolate(frame, [0, clearAt - 10], [-34, -26], { extrapolateRight: "clamp" });
  const x = taxi + 0.5 * 5 * roll * roll;
  const lift = Math.max(0, roll - 2.2);
  const y = GEAR_HEIGHT + 1.2 * Math.pow(lift, 1.6);
  const pitch = interpolate(roll, [2.0, 2.6], [0, 0.18], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-16, 6, 18], fov: 45 }} lookAt={[-14, 3.5, -4]}>
        <Ground />
        <Tower position={[-12, 0, -9]} />
        <group position={[x, y, 0]} rotation={[0, 0, pitch]}>
          <Airplane gear={interpolate(lift, [0.6, 1.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} flaps={0.5} fan={t * 20} />
        </group>
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, clearAt - 25, clearAt - 10)} style={{ maxWidth: 620 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>🎧 CONTROL TOWER</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#0d2340" }}>“Flight 9, runway 27, cleared for takeoff!”</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
