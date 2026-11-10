import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { CloudField, FORCE_COLORS, Stage } from "../../lib/common";
import { Bar, Ground } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const V_LIFTOFF = 8; // scene units per second
const KMH_AT_LIFTOFF = 270;

export const Takeoff: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = 20;
  const liftoff = Math.max(start + fps * 3, wordFrame(scene, "up", 0, scene.durationInFrames - 60) - 6);
  const tau = Math.max(0, (frame - start) / fps);
  const tauLo = (liftoff - start) / fps;
  const accel = V_LIFTOFF / tauLo;
  const after = Math.max(0, tau - tauLo);

  const v = tau < tauLo ? accel * tau : V_LIFTOFF * (1 + 0.08 * after);
  const x = tau < tauLo ? 0.5 * accel * tau * tau : 0.5 * V_LIFTOFF * tauLo + V_LIFTOFF * after * (1 + 0.04 * after);
  const pitch = interpolate(after, [0, 0.8], [0, 0.2], { extrapolateRight: "clamp" });
  const y = GEAR_HEIGHT + 1.4 * Math.pow(Math.max(0, after - 0.2), 1.5);
  const gear = interpolate(after, [1.2, 2.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lift = Math.pow(v / (V_LIFTOFF * 0.97), 2);
  const airborne = after > 0;
  const flash = airborne ? interpolate(after, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 2, 2.6 + (y - GEAR_HEIGHT) * 0.5, 16] }} lookAt={[x + 1.5, 1.6 + (y - GEAR_HEIGHT) * 0.75, 0]}>
        <CloudField speed={0.3} count={10} seed="takeoff" y={[6, 12]} z={[-60, -30]} spread={140} />
        <Ground />
        <group position={[x, y, 0]} rotation={[0, 0, pitch]}>
          <Airplane gear={gear} fan={tau * 35} />
        </group>
      </Stage>
      <AbsoluteFill style={{ alignItems: "flex-end", padding: 56, fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "rgba(255,255,255,0.9)", borderRadius: 24, padding: "22px 30px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>SPEED</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums" }}>
            {Math.round((v / V_LIFTOFF) * KMH_AT_LIFTOFF)} km/h
          </div>
          <Bar label="LIFT" value={lift} color={FORCE_COLORS.lift} />
          <Bar label="WEIGHT" value={1} color={FORCE_COLORS.weight} />
          <div style={{ marginTop: 18, fontSize: 40, fontWeight: 900, color: FORCE_COLORS.lift, opacity: flash, transform: `scale(${0.8 + 0.2 * flash})` }}>
            LIFT &gt; WEIGHT → UP! 🛫
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
