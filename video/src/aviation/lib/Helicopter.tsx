import * as THREE from "three";

const RED = "#d93d3d";
const WHITE = "#f4f6fa";
const GLASS = "#1d3550";
const DARK = "#2a2f38";
const HIGHLIGHT = "#ffcc00";

export type HelicopterProps = {
  /** Main rotor angle (radians); it turns counterclockwise seen from above. */
  rotor?: number;
  /** Tail rotor angle (radians). */
  tail?: number;
  /** Blade pitch (collective), radians: more angle = more lift. */
  collective?: number;
  /** Rotor disc tilt (cyclic): [forward, right] in radians. */
  tilt?: [number, number];
  /** 0..1 translucent "spinning" disc for a fast rotor. */
  blur?: number;
  /** Highlight parts in yellow. */
  highlight?: { blades?: boolean; tailRotor?: boolean };
};

/** Distance from the helicopter's origin down to the bottom of its skids. */
export const SKID_HEIGHT = 1.22;
/** Height of the main rotor hub above the origin. */
export const ROTOR_Y = 1.55;
export const TAIL_ROTOR: [number, number, number] = [-5.05, 1.0, 0.16];

const Blade: React.FC<{ angle: number; pitch: number; on?: boolean }> = ({ angle, pitch, on }) => (
  <group rotation={[0, angle, 0]}>
    <mesh position={[2.15, 0, 0]} rotation={[pitch, 0, 0]}>
      <boxGeometry args={[4.1, 0.035, 0.24]} />
      <meshStandardMaterial color={on ? HIGHLIGHT : "#30353e"} emissive={on ? HIGHLIGHT : "#000000"} emissiveIntensity={on ? 0.5 : 0} metalness={0.4} roughness={0.4} />
    </mesh>
    <mesh position={[4.1, 0, 0]} rotation={[pitch, 0, 0]}>
      <boxGeometry args={[0.18, 0.04, 0.245]} />
      <meshStandardMaterial color={on ? HIGHLIGHT : RED} />
    </mesh>
  </group>
);

/** A light rescue helicopter. The nose points along +x, up is +y, right is +z. */
export const Helicopter: React.FC<HelicopterProps> = ({ rotor = 0, tail = 0, collective = 0.08, tilt = [0, 0], blur = 0, highlight = {} }) => (
  <group>
    {/* Cabin and canopy */}
    <mesh scale={[1.55, 0.95, 0.92]}>
      <sphereGeometry args={[1, 40, 28]} />
      <meshStandardMaterial color={RED} metalness={0.15} roughness={0.35} />
    </mesh>
    <mesh position={[0.62, 0.12, 0]} scale={[1.0, 0.82, 0.86]}>
      <sphereGeometry args={[0.95, 40, 28]} />
      <meshStandardMaterial color={GLASS} metalness={0.6} roughness={0.1} />
    </mesh>
    {/* White belly band */}
    <mesh position={[-0.05, -0.38, 0]} scale={[1.5, 0.55, 0.9]}>
      <sphereGeometry args={[1, 40, 20, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45]} />
      <meshStandardMaterial color={WHITE} side={THREE.DoubleSide} />
    </mesh>
    {/* Side windows */}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[-0.45, 0.2, s * 0.83]} rotation={[0, 0, 0]} scale={[1, 0.8, 0.12]}>
        <sphereGeometry args={[0.42, 24, 16]} />
        <meshStandardMaterial color={GLASS} metalness={0.6} roughness={0.1} />
      </mesh>
    ))}
    {/* Engine housing and mast */}
    <mesh position={[-0.35, 0.92, 0]} scale={[1.0, 0.35, 0.5]}>
      <sphereGeometry args={[1, 28, 16]} />
      <meshStandardMaterial color={WHITE} metalness={0.2} roughness={0.35} />
    </mesh>
    <mesh position={[0, 1.3, 0]}>
      <cylinderGeometry args={[0.07, 0.09, 0.5, 16]} />
      <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
    </mesh>
    {/* Main rotor: the disc tilts with the cyclic; blades turn and change pitch */}
    <group position={[0, ROTOR_Y, 0]} rotation={[tilt[1], 0, -tilt[0]]}>
      <mesh>
        <cylinderGeometry args={[0.2, 0.2, 0.14, 20]} />
        <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Blade key={i} angle={rotor + (i * Math.PI) / 2} pitch={collective} on={highlight.blades} />
      ))}
      {blur > 0.01 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 4.2, 64]} />
          <meshBasicMaterial color="#c8d0dc" transparent opacity={0.22 * blur} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
    {/* Tail boom, fins and tail rotor */}
    <mesh position={[-3.1, 0.3, 0]} rotation={[0, 0, Math.PI / 2 + 0.07]}>
      <cylinderGeometry args={[0.13, 0.32, 3.9, 20]} />
      <meshStandardMaterial color={WHITE} metalness={0.15} roughness={0.35} />
    </mesh>
    <mesh position={[-5.0, 0.95, 0]} rotation={[0, 0, -0.35]}>
      <boxGeometry args={[0.55, 1.15, 0.07]} />
      <meshStandardMaterial color={RED} />
    </mesh>
    <mesh position={[-4.55, 0.45, 0]}>
      <boxGeometry args={[0.42, 0.05, 1.1]} />
      <meshStandardMaterial color={RED} />
    </mesh>
    <group position={TAIL_ROTOR} rotation={[0, 0, tail]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
        <meshStandardMaterial color={DARK} />
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
          <boxGeometry args={[0.07, 1.05, 0.02]} />
          <meshStandardMaterial color={highlight.tailRotor ? HIGHLIGHT : "#30353e"} emissive={highlight.tailRotor ? HIGHLIGHT : "#000000"} emissiveIntensity={highlight.tailRotor ? 0.5 : 0} />
        </mesh>
      ))}
      {blur > 0.01 ? (
        <mesh>
          <circleGeometry args={[0.55, 32]} />
          <meshBasicMaterial color="#c8d0dc" transparent opacity={0.25 * blur} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
    {/* Skids and struts */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[0.1, -SKID_HEIGHT + 0.05, s * 0.8]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 2.8, 12]} />
          <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[1.58, -SKID_HEIGHT + 0.13, s * 0.8]} rotation={[0, 0, 0.9]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 12]} />
          <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
        </mesh>
        {[-0.6, 0.7].map((x) => (
          <mesh key={x} position={[x, -0.85, s * 0.66]} rotation={[s * 0.35, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.75, 10]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);
