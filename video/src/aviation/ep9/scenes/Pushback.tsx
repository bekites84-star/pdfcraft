import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, PARKED_Y, Tug, useT } from "../airport";

/** The tug pushes the plane straight back, then swings its tail round to face the taxiway. */
export const Pushback: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const closedAt = wordFrame(scene, "closed", 0, 20);
  const tugAt = wordFrame(scene, "tug", 0, 70);
  const pushAt = wordFrame(scene, "pushes", 0, 90);
  const k = interpolate(frame, [pushAt, scene.durationInFrames - 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const back = interpolate(k, [0, 0.6, 1], [0, 6, 8]);
  const yaw = interpolate(k, [0.4, 1], [0, 0.9], { extrapolateLeft: "clamp" });
  // The nose gear sits about 2.55 ahead of the plane's origin; the plane pivots around the main gear.
  const ox = -back;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-1.5, 6.5, 9.5], fov: 45 }} lookAt={[-3.6, 0.6, 0]}>
        <Apron />
        <group position={[ox, PARKED_Y, 0]} rotation={[0, yaw, 0]}>
          <Airplane gear={1} fan={t * 4} />
          <group position={[0, -PARKED_Y, 0]}>
            <Tug position={[3.25, 0, 0]} heading={Math.PI} />
          </group>
        </group>
        <Label3D position={[ox + 3.3 * Math.cos(yaw), 1.4, -3.3 * Math.sin(yaw)]} text="tug" background="#b38600" opacity={ramp(frame, tugAt, tugAt + 10)} height={0.6} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, closedAt - 5, closedAt + 8)}>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#0d2340" }}>🚪 Doors closed ✓</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#b38600", opacity: ramp(frame, pushAt, pushAt + 10) }}>pushing back…</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
