import { random } from "remotion";
import * as THREE from "three";

/**
 * A cut-away turbofan. Air flows from the intake at +x to the exhaust at -x; the near half
 * (z > 0) of the casings is removed so the camera, on the +z side, can see inside.
 */

export const FAN_X = 3.4;
export const FAN_R = 1.55;
export const COMP: [number, number] = [2.7, 0.75]; // compressor from x to x
export const BURN: [number, number] = [0.6, -0.45]; // combustion chamber
export const TURB: [number, number] = [-0.6, -1.7]; // turbine
const DS = THREE.DoubleSide;

/** A half shell (the far side only) revolved around the x axis from (radius, x) points. */
function halfShell(points: [number, number][]): THREE.BufferGeometry {
  const g = new THREE.LatheGeometry(
    points.map(([r, x]) => new THREE.Vector2(r, x)),
    48,
    Math.PI / 2,
    Math.PI,
  );
  g.rotateZ(-Math.PI / 2);
  return g;
}

const nacelleGeo = halfShell([
  [1.62, 3.9],
  [1.72, 4.05],
  [1.82, 3.95],
  [1.86, 3.3],
  [1.84, 1.0],
  [1.7, -1.4],
  [1.62, -1.9],
]);
const coreGeo = halfShell([
  [0.98, 2.9],
  [0.95, 1.5],
  [0.9, 0.6],
  [0.92, -0.6],
  [1.0, -1.9],
  [0.85, -2.9],
  [0.62, -3.4],
]);

/** Radius of the core air path at station x (narrows through the compressor, opens in the turbine). */
export function coreRadius(x: number): number {
  if (x > COMP[0]) return 0.82;
  if (x > COMP[1]) return 0.82 - 0.3 * ((COMP[0] - x) / (COMP[0] - COMP[1]));
  if (x > TURB[0]) return 0.52;
  if (x > TURB[1]) return 0.52 + 0.18 * ((TURB[0] - x) / (TURB[0] - TURB[1]));
  return 0.62;
}

/** A ring of thin blades at station x. */
const BladeRing: React.FC<{ x: number; inner: number; outer: number; count: number; angle: number; twist?: number; color: string; emissive?: string; glow?: number }> = ({
  x,
  inner,
  outer,
  count,
  angle,
  twist = 0.6,
  color,
  emissive = "#000000",
  glow = 0,
}) => (
  <group position={[x, 0, 0]} rotation={[angle, 0, 0]}>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[inner, inner, 0.12, 24]} />
      <meshStandardMaterial color="#59606c" metalness={0.7} roughness={0.3} />
    </mesh>
    {Array.from({ length: count }, (_, i) => (
      <group key={i} rotation={[(i / count) * Math.PI * 2, 0, 0]}>
        <mesh position={[0, (inner + outer) / 2, 0]} rotation={[0, twist, 0]}>
          <boxGeometry args={[0.16, outer - inner, 0.012]} />
          <meshStandardMaterial color={color} metalness={0.75} roughness={0.28} emissive={emissive} emissiveIntensity={glow} side={DS} />
        </mesh>
      </group>
    ))}
  </group>
);

export type EngineProps = {
  /** Shaft angle in radians (fan, compressor and turbine all turn with it). */
  spin: number;
  t: number;
  highlight?: { fan?: boolean; compressor?: boolean; burner?: boolean; turbine?: boolean; shaft?: boolean };
  /** 0..1 strengths of the core flow, the bypass flow and the flame. */
  core?: number;
  bypass?: number;
  flame?: number;
};

const HL = "#ffcc00";

/** Position along the core path for flow parameter u (0 intake → 1 beyond the exhaust). */
function corePath(u: number): number {
  // Slow and bunched through the compressor (squeezed), fast out of the nozzle.
  const xs = [5.5, COMP[0], COMP[1], BURN[1], TURB[1], -3.4, -8];
  const us = [0, 0.18, 0.5, 0.62, 0.72, 0.8, 1];
  for (let i = 0; i < us.length - 1; i++) {
    const u0 = us[i] ?? 0;
    const u1 = us[i + 1] ?? 1;
    if (u <= u1) return (xs[i] ?? 0) + ((xs[i + 1] ?? 0) - (xs[i] ?? 0)) * ((u - u0) / (u1 - u0));
  }
  return -8;
}

/** Colour of the core air at station x: cool blue, warming in the compressor, flame orange after the burner. */
function airColor(x: number): string {
  if (x > COMP[0]) return "#bfe3ff";
  if (x > COMP[1]) return "#9fd0ff";
  if (x > BURN[0]) return "#ffe08a";
  if (x > TURB[1]) return "#ff8a3d";
  return "#ffb36b";
}

const Flow: React.FC<{ t: number; core: number; bypass: number }> = ({ t, core, bypass }) => (
  <>
    {core > 0.01
      ? Array.from({ length: 90 }, (_, i) => {
          const u = (((random(`cf${i}`) + t * 0.16) % 1) + 1) % 1;
          const x = corePath(u);
          // Only the far half and the edges, so particles don't hide the cut-away.
          const a = Math.PI / 2 + random(`ca${i}`) * Math.PI;
          const r = (x > 4 ? 0.82 + (x - 4) * 0.25 : coreRadius(x)) * (0.35 + random(`cr${i}`) * 0.6);
          const c = airColor(x);
          return (
            <mesh key={i} position={[x, Math.sin(a) * r, Math.cos(a) * r]} scale={[x < -3 ? 4 : 1.8, 1, 1]}>
              <sphereGeometry args={[0.045, 8, 6]} />
              <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.9} transparent opacity={core} />
            </mesh>
          );
        })
      : null}
    {bypass > 0.01
      ? Array.from({ length: 70 }, (_, i) => {
          const u = (((random(`bf${i}`) + t * 0.3) % 1) + 1) % 1;
          const x = 5.5 - u * 11;
          const a = Math.PI / 2 + random(`ba${i}`) * Math.PI;
          const r = 1.15 + random(`br${i}`) * 0.5;
          return (
            <mesh key={i} position={[x, Math.sin(a) * r, Math.cos(a) * r]} scale={[2.6, 1, 1]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial color="#7cc4ff" emissive="#4aa8ff" emissiveIntensity={0.7} transparent opacity={bypass} />
            </mesh>
          );
        })
      : null}
  </>
);

export const JetEngine: React.FC<EngineProps> = ({ spin, t, highlight = {}, core = 1, bypass = 0.6, flame = 1 }) => (
  <group>
    {/* Casings: far halves only */}
    <mesh geometry={nacelleGeo}>
      <meshStandardMaterial color="#e9edf3" metalness={0.2} roughness={0.35} side={DS} />
    </mesh>
    <mesh geometry={coreGeo}>
      <meshStandardMaterial color="#8a919c" metalness={0.6} roughness={0.35} side={DS} />
    </mesh>
    {/* Cut edges, painted red like a technical cut-away drawing */}
    {[1, -1].map((s) => (
      <mesh key={s} position={[1.0, s * 1.79, 0]}>
        <boxGeometry args={[5.9, 0.08, 0.02]} />
        <meshStandardMaterial color="#d93d3d" />
      </mesh>
    ))}
    {/* Shaft joining the turbine to the fan */}
    <mesh rotation={[0, 0, Math.PI / 2]} position={[0.7, 0, 0]}>
      <cylinderGeometry args={[0.12, 0.12, 5.6, 16]} />
      <meshStandardMaterial color={highlight.shaft ? HL : "#4a515d"} emissive={highlight.shaft ? HL : "#000000"} emissiveIntensity={highlight.shaft ? 0.5 : 0} metalness={0.7} roughness={0.3} />
    </mesh>
    {/* Fan and spinner */}
    <BladeRing x={FAN_X} inner={0.32} outer={FAN_R} count={22} angle={spin} twist={0.7} color={highlight.fan ? HL : "#5d6573"} emissive={highlight.fan ? HL : "#000000"} glow={highlight.fan ? 0.4 : 0} />
    <mesh position={[FAN_X + 0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[0.34, 0.75, 32]} />
      <meshStandardMaterial color="#e9edf3" metalness={0.4} roughness={0.3} />
    </mesh>
    {/* Compressor: many rows of shrinking blades */}
    {Array.from({ length: 9 }, (_, i) => {
      const x = COMP[0] - (i / 8) * (COMP[0] - COMP[1]);
      const outer = coreRadius(x);
      return (
        <BladeRing key={i} x={x} inner={0.2} outer={outer} count={18} angle={spin * 1.3 + i * 0.2} twist={0.5} color={highlight.compressor ? HL : "#9aa3b1"} emissive={highlight.compressor ? HL : "#000000"} glow={highlight.compressor ? 0.35 : 0} />
      );
    })}
    {/* Combustion chamber with fuel nozzles and flame */}
    <mesh position={[(BURN[0] + BURN[1]) / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.55, 0.55, BURN[0] - BURN[1], 32, 1, true, Math.PI / 2, Math.PI]} />
      <meshStandardMaterial color={highlight.burner ? HL : "#6b4a3a"} emissive={highlight.burner ? HL : "#ff6a1a"} emissiveIntensity={highlight.burner ? 0.4 : 0.25 * flame} side={DS} />
    </mesh>
    {flame > 0.01
      ? Array.from({ length: 40 }, (_, i) => {
          const u = (((random(`fl${i}`) + t * 1.4) % 1) + 1) % 1;
          const a = Math.PI / 2 + random(`fla${i}`) * Math.PI;
          const r = 0.25 + random(`flr${i}`) * 0.25;
          const x = BURN[0] - u * (BURN[0] - BURN[1] + 0.3);
          return (
            <mesh key={i} position={[x, Math.sin(a) * r, Math.cos(a) * r]} scale={0.6 + (1 - u) * 0.8}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshBasicMaterial color={u < 0.4 ? "#fff1a8" : "#ff7a1a"} transparent opacity={flame * (1 - u * 0.7)} />
            </mesh>
          );
        })
      : null}
    {/* Turbine: rows of hot blades */}
    {Array.from({ length: 4 }, (_, i) => {
      const x = TURB[0] - (i / 3) * (TURB[0] - TURB[1]);
      return (
        <BladeRing key={i} x={x} inner={0.22} outer={coreRadius(x)} count={20} angle={-spin * 1.3 + i * 0.3} twist={-0.6} color={highlight.turbine ? HL : "#b07a52"} emissive={highlight.turbine ? HL : "#ff6a1a"} glow={highlight.turbine ? 0.4 : 0.15} />
      );
    })}
    {/* Exhaust plug */}
    <mesh position={[-3.0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <coneGeometry args={[0.4, 1.2, 32]} />
      <meshStandardMaterial color="#7d8593" metalness={0.7} roughness={0.35} />
    </mesh>
    <Flow t={t} core={core} bypass={bypass} />
  </group>
);
