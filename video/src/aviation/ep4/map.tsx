import { random } from "remotion";
import { Mountain } from "../lib/props";

/** A patchwork of fields seen from above, with a river and some hills. */
export const Patchwork: React.FC<{ y?: number; size?: [number, number]; cell?: number; seed?: string }> = ({ y = 0, size = [60, 40], cell = 4, seed = "fields" }) => {
  const cols = Math.ceil(size[0] / cell);
  const rows = Math.ceil(size[1] / cell);
  const palette = ["#7fbf5f", "#6aa84f", "#a8cf6a", "#c9d97a", "#5e9a47", "#d9c47a"];
  return (
    <group position={[0, y, 0]}>
      {Array.from({ length: cols * rows }, (_, i) => {
        const cx = (i % cols) * cell - size[0] / 2 + cell / 2;
        const cz = Math.floor(i / cols) * cell - size[1] / 2 + cell / 2;
        const color = palette[Math.floor(random(`${seed}-${i}`) * palette.length)] ?? "#7fbf5f";
        return (
          <mesh key={i} position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[cell * 0.97, cell * 0.97]} />
            <meshStandardMaterial color={color} roughness={1} />
          </mesh>
        );
      })}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] + 2, size[1] + 2]} />
        <meshStandardMaterial color="#e9e2c8" roughness={1} />
      </mesh>
    </group>
  );
};

/** A meandering river made of short blue segments. */
export const River: React.FC<{ y?: number; from: number; to: number; z0?: number; seed?: number }> = ({ y = 0.02, from, to, z0 = 0, seed = 1 }) => {
  const n = 40;
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const x = from + ((to - from) * i) / n;
    return [x, z0 + Math.sin(x * 0.35 + seed) * 2.2 + Math.sin(x * 0.13) * 1.5] as const;
  });
  return (
    <group>
      {pts.slice(1).map(([x, z], i) => {
        const prev = pts[i];
        if (!prev) return null;
        const dx = x - prev[0];
        const dz = z - prev[1];
        const len = Math.hypot(dx, dz);
        return (
          <mesh key={i} position={[(x + prev[0]) / 2, y, (z + prev[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
            <boxGeometry args={[len + 0.05, 0.02, 0.9]} />
            <meshStandardMaterial color="#3f8fd8" roughness={0.4} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Hills: React.FC<{ spots: [number, number, number][] }> = ({ spots }) => (
  <>
    {spots.map(([x, z, h], i) => (
      <Mountain key={i} position={[x, 0, z]} height={h} radius={h * 0.9} seed={i + 7} />
    ))}
  </>
);
