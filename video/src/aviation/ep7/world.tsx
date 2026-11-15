import { useCurrentFrame, useVideoConfig } from "remotion";

/** Grass with a few trees scattered around. */
export const Field: React.FC<{ size?: number }> = ({ size = 160 }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[size, size]} />
      <meshStandardMaterial color="#79b65d" roughness={1} />
    </mesh>
    {Array.from({ length: 26 }, (_, i) => {
      const a = i * 2.39996;
      const r = 14 + (i % 5) * 5;
      return (
        <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r - 6]}>
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.15, 0.2, 1, 8]} />
            <meshStandardMaterial color="#7a5232" />
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <coneGeometry args={[1, 2.6, 12]} />
            <meshStandardMaterial color="#2f7d3c" />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** A helipad: grey disc, yellow ring and a white "H". */
export const Helipad: React.FC<{ position?: [number, number, number]; radius?: number }> = ({ position = [0, 0, 0], radius = 3 }) => (
  <group position={position}>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <circleGeometry args={[radius, 48]} />
      <meshStandardMaterial color="#50555e" />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[radius * 0.82, radius * 0.9, 48]} />
      <meshStandardMaterial color="#ffd23f" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, 0.03, s * radius * 0.28]}>
        <boxGeometry args={[radius * 0.95, 0.01, radius * 0.14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}
    <mesh position={[0, 0.03, 0]}>
      <boxGeometry args={[radius * 0.14, 0.01, radius * 0.56]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

/** Rings of flattened grass spreading out under the rotor's downwash. */
export const Downwash: React.FC<{ position: [number, number, number]; strength: number }> = ({ position, strength }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (strength <= 0.01) return null;
  return (
    <group position={position}>
      {[0, 0.25, 0.5, 0.75].map((ph) => {
        const u = (t * 0.8 + ph) % 1;
        const r = 1.5 + u * 6;
        return (
          <mesh key={ph} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
            <ringGeometry args={[r, r + 0.25, 48]} />
            <meshBasicMaterial color="#d8f0c8" transparent opacity={(1 - u) * 0.6 * strength} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Fast rotor angle for a spinning rotor at time t. */
export const spin = (t: number, rate = 14) => t * rate;
