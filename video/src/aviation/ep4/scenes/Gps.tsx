import { Line } from "@react-three/drei";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const EARTH_R = 3;
const ORBIT_R = 5.6;
const SATS = Array.from({ length: 8 }, (_, i) => ({
  phase: (i / 8) * Math.PI * 2,
  tilt: ((i % 4) - 1.5) * 0.45,
  speed: 0.12 + (i % 3) * 0.02,
}));

/** Position of satellite i at time t, on a tilted circular orbit. */
function satPos(i: number, t: number): THREE.Vector3 {
  const s = SATS[i];
  if (!s) return new THREE.Vector3();
  const a = s.phase + t * s.speed;
  return new THREE.Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R).applyAxisAngle(new THREE.Vector3(1, 0, 0), s.tilt).applyAxisAngle(new THREE.Vector3(0, 0, 1), s.tilt * 0.6);
}

const Satellite: React.FC<{ position: THREE.Vector3; glow: number; size: number }> = ({ position, glow, size }) => (
  <group position={position} scale={Math.max(0.001, size)}>
    <mesh>
      <boxGeometry args={[0.28, 0.28, 0.4]} />
      <meshStandardMaterial color="#d9b44a" metalness={0.7} roughness={0.3} emissive="#ffcc55" emissiveIntensity={glow} />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 0.55, 0, 0]}>
        <boxGeometry args={[0.7, 0.02, 0.3]} />
        <meshStandardMaterial color="#2a4fa8" metalness={0.5} roughness={0.3} />
      </mesh>
    ))}
  </group>
);

/** Earth with continents and orbiting GPS satellites; four of them signal the plane. */
export const Gps: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const satsIn = ramp(frame, wordFrame(scene, "satellites", 0, 60) - 5, wordFrame(scene, "satellites", 0, 60) + 15);
  const listen = ramp(frame, wordFrame(scene, "listening", 0, 220), wordFrame(scene, "listening", 0, 220) + 15);
  const found = ramp(frame, wordFrame(scene, "exactly", 0, 300), wordFrame(scene, "exactly", 0, 300) + 10);
  // The plane sits on the side of the Earth facing the camera.
  const plane = new THREE.Vector3(0.9, 1.6, 2.4).normalize().multiplyScalar(EARTH_R + 0.08);
  const sats = SATS.map((_, i) => satPos(i, t));
  const nearest = sats
    .map((p, i) => ({ i, d: p.distanceTo(plane) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((x) => x.i);
  return (
    <AbsoluteFill>
      <Stage background="radial-gradient(circle at 50% 45%, #10224a 0%, #050a18 75%)" camera={{ position: [1.5, 3, 13.5] }} lookAt={[0, 0.6, 0]}>
        {/* Stars */}
        {Array.from({ length: 120 }, (_, i) => (
          <mesh key={i} position={[(random(`st${i}`) - 0.5) * 60, (random(`sy${i}`) - 0.5) * 34, -20 - random(`sz${i}`) * 10]}>
            <sphereGeometry args={[0.04 + random(`sr${i}`) * 0.05, 6, 6]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
        <group rotation={[0, t * 0.05, 0]}>
          <mesh>
            <sphereGeometry args={[EARTH_R, 64, 48]} />
            <meshStandardMaterial color="#2b6fd6" roughness={0.6} />
          </mesh>
          {Array.from({ length: 26 }, (_, i) => {
            const u = random(`c${i}`) * Math.PI * 2;
            const w = Math.acos(2 * random(`cw${i}`) - 1);
            const n = new THREE.Vector3(Math.sin(w) * Math.cos(u), Math.cos(w), Math.sin(w) * Math.sin(u));
            const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
            // A spherical cap hugging the globe; overlapping caps make irregular continents.
            const cap = (0.5 + random(`cs${i}`) * 0.9) / EARTH_R;
            return (
              <mesh key={i} quaternion={q}>
                <sphereGeometry args={[EARTH_R + 0.012 + (i % 3) * 0.002, 32, 8, 0, Math.PI * 2, 0, cap]} />
                <meshStandardMaterial color={i % 7 === 0 ? "#e8f1f7" : "#4c9a4a"} roughness={0.9} />
              </mesh>
            );
          })}
        </group>
        {/* Thin atmosphere glow */}
        <mesh>
          <sphereGeometry args={[EARTH_R * 1.05, 48, 32]} />
          <meshBasicMaterial color="#7cc4ff" transparent opacity={0.12} side={THREE.BackSide} />
        </mesh>
        {sats.map((p, i) => (
          <Satellite key={i} position={p} size={satsIn} glow={listen > 0 && nearest.includes(i) ? 0.5 + 0.5 * Math.sin(t * 8 + i) : 0} />
        ))}
        {nearest.map((i) => {
          const p = sats[i];
          if (!p || listen <= 0) return null;
          const pulse = (t * 0.9 + i * 0.27) % 1;
          return (
            <group key={`sig${i}`}>
              <Line points={[p.toArray() as [number, number, number], plane.toArray() as [number, number, number]]} color="#ffd84a" lineWidth={2.5} transparent opacity={0.7 * listen} />
              <mesh position={p.clone().lerp(plane, pulse)}>
                <sphereGeometry args={[0.09, 10, 8]} />
                <meshBasicMaterial color="#fff2a8" />
              </mesh>
            </group>
          );
        })}
        <mesh position={plane}>
          <sphereGeometry args={[0.13 + 0.05 * found * Math.sin(t * 6), 16, 12]} />
          <meshBasicMaterial color="#ff4d6d" />
        </mesh>
        <Label3D position={plane.clone().add(new THREE.Vector3(0.2, -0.75, 0.6)).toArray() as [number, number, number]} text="✈ you are here!" background="#e5484d" opacity={found} height={0.55} />
        <Label3D position={(sats[nearest[0] ?? 0] ?? new THREE.Vector3()).clone().add(new THREE.Vector3(0, 0.75, 0)).toArray() as [number, number, number]} text="GPS satellite" background="#b38600" opacity={satsIn * (1 - listen)} height={0.5} />
      </Stage>
    </AbsoluteFill>
  );
};
