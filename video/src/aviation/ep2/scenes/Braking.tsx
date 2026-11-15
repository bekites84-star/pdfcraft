import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { Bar, Ground, InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const V0 = 6.5;
const KMH0 = 240;

/** Engine air blown forward and outward (reverse thrust), in the plane's frame. */
const ReverseThrust: React.FC<{ z: number; t: number; strength: number }> = ({ z, t, strength }) => {
  if (strength <= 0.01) return null;
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const u = (((random(`rv-${z}-${i}`) + t * 1.4) % 1) + 1) % 1;
        const side = Math.sign(z) || 1;
        return (
          <mesh key={i} position={[0.3 + u * 2.2, -0.64 + (random(`rvy-${i}`) - 0.5) * 0.4 + u * 0.3, z + side * u * 1.2]} scale={[2.5, 1, 1]}>
            <sphereGeometry args={[0.05, 8, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#bfe0ff" emissiveIntensity={0.9} transparent opacity={(1 - u) * strength} />
          </mesh>
        );
      })}
    </>
  );
};

/** Rolling out: spoilers up, reverse thrust, brakes — the speed falls to zero. */
export const Braking: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const T = Math.max(1, scene.durationInFrames / fps - 1.2);
  const k = Math.min(1, t / T);
  const v = V0 * Math.pow(1 - k, 1.3);
  const x = ((V0 * T) / 2.3) * (1 - Math.pow(1 - k, 2.3));
  const spoilAt = wordFrame(scene, "spoilers", 0, 40);
  const engAt = wordFrame(scene, "engines", 0, 140);
  const brakeAt = wordFrame(scene, "brakes", 0, 220);
  const spoilers = ramp(frame, spoilAt, spoilAt + 12);
  const reverse = ramp(frame, engAt, engAt + 15) * (1 - ramp(frame, scene.durationInFrames - 60, scene.durationInFrames - 30));
  const brakes = ramp(frame, brakeAt, brakeAt + 20) * (v > 0.2 ? 1 : 0.4);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 6, 3.6, 10] }} lookAt={[x + 0.5, 0.8, 0]}>
        <CloudField speed={0.3} count={8} seed="ep2-brake" y={[6, 12]} z={[-60, -30]} spread={140} />
        <group position={[-30, 0, 0]}>
          <Ground />
        </group>
        <group position={[x, GEAR_HEIGHT, 0]}>
          <Airplane fan={t * 12} gear={1} flaps={1} spoilers={spoilers} brakes={brakes} highlight={{ spoilers: spoilers > 0.01 }} />
          <ReverseThrust z={1.6} t={t} strength={reverse} />
          <ReverseThrust z={-1.6} t={t} strength={reverse} />
          <Label3D position={[-0.6, 1.3, 1.8]} text="spoilers UP" background="#b38600" opacity={spoilers} height={0.45} />
          <Label3D position={[2.6, -0.2, 2.6]} text="air blown FORWARD" background="#2f7cf6" opacity={reverse} height={0.45} />
          <Label3D position={[-0.2, -1.3, 1.4]} text="brakes" background="#e5484d" opacity={ramp(frame, brakeAt, brakeAt + 12)} height={0.45} />
        </group>
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>SPEED</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums" }}>{Math.round((v / V0) * KMH0)} km/h</div>
        <Bar label="LIFT" value={interpolate(spoilers, [0, 1], [0.6, 0.08]) * (v / V0)} color="#22b35e" />
      </InfoCard>
    </AbsoluteFill>
  );
};
