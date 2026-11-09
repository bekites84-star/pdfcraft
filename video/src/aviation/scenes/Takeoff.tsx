import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../Airplane";
import { CloudField, Stage } from "../common";
import { FORCE_COLORS } from "./Forces";
import { wordFrame, type SceneTimeline } from "../timeline";

const V_LIFTOFF = 8; // scene units per second
const KMH_AT_LIFTOFF = 270;

const Ground: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, 0, 0]}>
      <planeGeometry args={[400, 200]} />
      <meshStandardMaterial color="#6fb35f" roughness={1} />
    </mesh>
    <mesh position={[60, 0.01, 0]}>
      <boxGeometry args={[180, 0.02, 6]} />
      <meshStandardMaterial color="#4a4f58" roughness={0.9} />
    </mesh>
    {Array.from({ length: 45 }, (_, i) => (
      <mesh key={i} position={[-25 + i * 4, 0.03, 0]}>
        <boxGeometry args={[2, 0.01, 0.18]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}
    {[-2.8, 2.8].map((z) => (
      <mesh key={z} position={[60, 0.03, z]}>
        <boxGeometry args={[180, 0.01, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}
    {Array.from({ length: 30 }, (_, i) => (
      <group key={i} position={[-20 + i * 6.5, 0, -9 - (i % 3) * 2.5]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
          <meshStandardMaterial color="#7a5232" />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <coneGeometry args={[0.8, 2.2, 12]} />
          <meshStandardMaterial color="#2f7d3c" />
        </mesh>
      </group>
    ))}
  </group>
);

const Bar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
    <div style={{ width: 170, fontWeight: 800, fontSize: 34, color }}>{label}</div>
    <div style={{ width: 360, height: 30, borderRadius: 15, background: "rgba(13,35,64,0.15)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value * 80)}%`, height: "100%", background: color, borderRadius: 15 }} />
    </div>
  </div>
);

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
