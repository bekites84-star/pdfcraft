import { useCurrentFrame, useVideoConfig } from "remotion";
import { GEAR_HEIGHT } from "../lib/Airplane";

/**
 * Airport apron props. The parked airliner sits at the origin with its nose (+x) toward the
 * terminal; its right side (+z) faces the service vehicles.
 */

export const APRON = "#9097a0";

const Wheel: React.FC<{ position: [number, number, number]; r?: number }> = ({ position, r = 0.12 }) => (
  <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[r, r, 0.08, 14]} />
    <meshStandardMaterial color="#1b1e24" />
  </mesh>
);

/** Concrete apron with a yellow lead-in line, a terminal with glass front and a jet bridge. */
export const Apron: React.FC<{ bridge?: boolean }> = ({ bridge = true }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[160, 160]} />
      <meshStandardMaterial color={APRON} roughness={1} />
    </mesh>
    <mesh position={[-4, 0.01, 0]}>
      <boxGeometry args={[30, 0.01, 0.12]} />
      <meshStandardMaterial color="#ffd23f" />
    </mesh>
    {/* Terminal */}
    <mesh position={[11, 2.2, -6]}>
      <boxGeometry args={[4, 4.4, 26]} />
      <meshStandardMaterial color="#d9dee5" />
    </mesh>
    <mesh position={[8.98, 2.6, -6]}>
      <boxGeometry args={[0.02, 2.6, 25]} />
      <meshStandardMaterial color="#5f86b8" metalness={0.5} roughness={0.15} />
    </mesh>
    {bridge ? (
      <group>
        {/* Jet bridge from the terminal to the front left door */}
        <mesh position={[5.6, 1.15, -3.3]} rotation={[0, 0.62, 0]}>
          <boxGeometry args={[7.4, 0.7, 0.7]} />
          <meshStandardMaterial color="#c3c9d2" />
        </mesh>
        <mesh position={[2.45, 1.05, -0.95]}>
          <boxGeometry args={[0.8, 0.75, 0.8]} />
          <meshStandardMaterial color="#9aa3b1" />
        </mesh>
        <mesh position={[3.6, 0.4, -1.9]}>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 8]} />
          <meshStandardMaterial color="#59606c" />
        </mesh>
      </group>
    ) : null}
  </group>
);

/** Air traffic control tower: a tall shaft with a glass cab on top. */
export const Tower: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 3.5, 0]}>
      <cylinderGeometry args={[0.7, 0.9, 7, 20]} />
      <meshStandardMaterial color="#e3e7ec" />
    </mesh>
    <mesh position={[0, 7.6, 0]}>
      <cylinderGeometry args={[1.7, 1.2, 1.2, 8]} />
      <meshStandardMaterial color="#2c4f7a" metalness={0.5} roughness={0.15} />
    </mesh>
    <mesh position={[0, 8.35, 0]}>
      <cylinderGeometry args={[1.8, 1.8, 0.3, 8]} />
      <meshStandardMaterial color="#e3e7ec" />
    </mesh>
    <mesh position={[0, 8.9, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 0.9, 6]} />
      <meshStandardMaterial color="#e5484d" emissive="#e5484d" emissiveIntensity={0.6} />
    </mesh>
  </group>
);

/** A small person: hi-vis ground crew, or a pilot (white shirt, cap). Legs swing when walking. */
export const Person: React.FC<{ position: [number, number, number]; heading?: number; walk?: number; pilot?: boolean; scale?: number }> = ({
  position,
  heading = 0,
  walk = 0,
  pilot = false,
  scale = 0.32,
}) => {
  const swing = Math.sin(walk * 8) * 0.5 * (walk > 0 ? 1 : 0);
  return (
    <group position={position} rotation={[0, heading, 0]} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0.9, s * 0.13]} rotation={[0, 0, s * swing]}>
          <mesh position={[0, -0.45, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
            <meshStandardMaterial color={pilot ? "#141a2a" : "#2b3a55"} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.22, 0.2, 0.8, 12]} />
        <meshStandardMaterial color={pilot ? "#f4f6fa" : "#ff8a1a"} />
      </mesh>
      <mesh position={[0, 1.88, 0]}>
        <sphereGeometry args={[0.17, 14, 12]} />
        <meshStandardMaterial color="#c68c5c" />
      </mesh>
      {pilot ? (
        <mesh position={[0, 2.02, 0]}>
          <cylinderGeometry args={[0.18, 0.17, 0.1, 14]} />
          <meshStandardMaterial color="#141a2a" />
        </mesh>
      ) : (
        <mesh position={[0, 1.98, 0]}>
          <sphereGeometry args={[0.18, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#ffd23f" />
        </mesh>
      )}
    </group>
  );
};

/** A suitcase: a coloured box with a handle and a white tag. */
export const Suitcase: React.FC<{ position: [number, number, number]; color: string; rotation?: number }> = ({ position, color, rotation = 0 }) => (
  <group position={position} rotation={[0, rotation, 0]}>
    <mesh>
      <boxGeometry args={[0.32, 0.22, 0.14]} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.13, 0]}>
      <boxGeometry args={[0.12, 0.03, 0.03]} />
      <meshStandardMaterial color="#20242b" />
    </mesh>
    <mesh position={[0.12, 0.05, 0.075]}>
      <boxGeometry args={[0.06, 0.09, 0.005]} />
      <meshStandardMaterial color="#ffffff" />
    </mesh>
  </group>
);

export const BAG_COLORS = ["#e5484d", "#2f7cf6", "#22b35e", "#f08a24", "#8e44ad", "#14a3a3", "#2a2f38"];

/** A truck chassis with a cab; `children` is the body on the back. Faces +x. */
export const Truck: React.FC<{ position: [number, number, number]; heading?: number; color: string; length?: number; children?: React.ReactNode }> = ({
  position,
  heading = 0,
  color,
  length = 2.2,
  children,
}) => (
  <group position={position} rotation={[0, heading, 0]}>
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[length, 0.16, 0.8]} />
      <meshStandardMaterial color="#3a404b" />
    </mesh>
    <mesh position={[length / 2 - 0.3, 0.7, 0]}>
      <boxGeometry args={[0.6, 0.65, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
    <mesh position={[length / 2 - 0.01, 0.82, 0]}>
      <boxGeometry args={[0.03, 0.3, 0.7]} />
      <meshStandardMaterial color="#2c4f7a" metalness={0.5} roughness={0.15} />
    </mesh>
    {[length / 2 - 0.35, -length / 2 + 0.35].map((x) => [-0.42, 0.42].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.15, z]} r={0.15} />))}
    {children}
  </group>
);

/** A small baggage cart with bags on it. */
export const Cart: React.FC<{ position: [number, number, number]; seed: number; bags?: number }> = ({ position, seed, bags = 4 }) => (
  <group position={position}>
    <mesh position={[0, 0.22, 0]}>
      <boxGeometry args={[0.9, 0.06, 0.6]} />
      <meshStandardMaterial color="#59606c" />
    </mesh>
    {[-0.3, 0.3].map((x) => [-0.25, 0.25].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.1, z]} r={0.1} />))}
    {Array.from({ length: bags }, (_, i) => (
      <Suitcase key={i} position={[-0.2 + (i % 2) * 0.4, 0.37 + Math.floor(i / 2) * 0.23, 0]} color={BAG_COLORS[(seed + i) % BAG_COLORS.length] ?? "#e5484d"} />
    ))}
  </group>
);

/** Low pushback tug that hooks onto the nose gear. Faces +x. */
export const Tug: React.FC<{ position: [number, number, number]; heading?: number }> = ({ position, heading = 0 }) => (
  <group position={position} rotation={[0, heading, 0]}>
    <mesh position={[0, 0.28, 0]}>
      <boxGeometry args={[1.3, 0.34, 0.85]} />
      <meshStandardMaterial color="#ffd23f" />
    </mesh>
    <mesh position={[0.25, 0.55, 0]}>
      <boxGeometry args={[0.45, 0.22, 0.6]} />
      <meshStandardMaterial color="#2c4f7a" metalness={0.4} roughness={0.2} />
    </mesh>
    <mesh position={[-0.85, 0.25, 0]}>
      <boxGeometry args={[0.5, 0.05, 0.06]} />
      <meshStandardMaterial color="#20242b" />
    </mesh>
    {[-0.4, 0.4].map((x) => [-0.45, 0.45].map((z) => <Wheel key={`${x}${z}`} position={[x, 0.15, z]} r={0.15} />))}
  </group>
);

/** Height of the parked plane's origin above the apron. */
export const PARKED_Y = GEAR_HEIGHT;

/** Seconds since the scene started. */
export const useT = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return frame / fps;
};
