import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, FORCE_COLORS, Stage } from "../../lib/common";
import { Bar, InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

/** Rear 3/4 view of the wing as the flaps slide out; speed falls while lift stays up. */
export const Flaps: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slowAt = wordFrame(scene, "slowly", 0, 30);
  const lessAt = wordFrame(scene, "less", 0, 90);
  const flapsAt = wordFrame(scene, "flaps", 0, 160);
  const extraAt = wordFrame(scene, "extra", 0, 260);
  const slow = ramp(frame, slowAt, slowAt + 60);
  const flaps = ramp(frame, flapsAt, flapsAt + 45);
  const kmh = Math.round(interpolate(slow, [0, 1], [450, 260]));
  // Lift dips as the plane slows, then the flaps bring it back.
  const lift = 1.02 - 0.32 * ramp(frame, slowAt, lessAt + 20) + 0.32 * flaps;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-6.5, 3.4, 7.5] }} lookAt={[-0.6, -0.2, 1.6]}>
        <CloudField speed={1.6} count={12} seed="ep2-flaps" />
        <group rotation={[0, 0, 0.04]}>
          <Airplane fan={frame / fps / 2} flaps={flaps} highlight={{ flaps: frame >= flapsAt }} />
        </group>
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>SPEED</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums" }}>{kmh} km/h</div>
        <Bar label="LIFT" value={lift} color={FORCE_COLORS.lift} />
        <Bar label="WEIGHT" value={1} color={FORCE_COLORS.weight} />
        <div style={{ marginTop: 16, fontSize: 34, fontWeight: 800, color: "#b38600", opacity: ramp(frame, extraAt, extraAt + 12) }}>
          Flaps = bigger wing → more lift
        </div>
      </InfoCard>
    </AbsoluteFill>
  );
};
