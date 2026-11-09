import { Line } from "@react-three/drei";
import * as THREE from "three";
import { airplaneGeometry, fuselagePoint, wingY, type Hinged } from "./airplaneGeometry";

const BODY = "#f6f8fc";
const GLASS = "#141b28";
const METAL = "#9aa3b1";
const HIGHLIGHT = "#ffcc00";
const BLUE = "#1546c8";
const SKY_BLUE = "#2fa3ec";
const DS = THREE.DoubleSide;

export type AirplaneProps = {
  /** Aileron deflection in radians: positive = right aileron down, left up (rolls left). */
  aileron?: number;
  /** Elevator deflection in radians: positive = trailing edge up (nose up). */
  elevator?: number;
  /** Rudder deflection in radians: positive = trailing edge left (nose left). */
  rudder?: number;
  /** Highlight the control surfaces in yellow. */
  highlight?: { ailerons?: boolean; elevator?: boolean; rudder?: boolean; flaps?: boolean; spoilers?: boolean };
  /** 1 = landing gear down, 0 = retracted. */
  gear?: number;
  /** Fan rotation angle in radians. */
  fan?: number;
  /** 0 = flaps up, 1 = fully extended (slide back and down). */
  flaps?: number;
  /** 0 = spoilers flat, 1 = fully raised. */
  spoilers?: number;
  /** 0..1: wheel brakes glowing hot. */
  brakes?: number;
  /** 0..1: warm glow from the cabin windows. */
  cabinGlow?: number;
};

/** Distance from the plane's origin to the bottom of its wheels, with the gear down. */
export const GEAR_HEIGHT = 0.93;
/** Engine centres (right side; the left is mirrored in z). */
export const ENGINE = { x: 0.75, y: -0.64, z: 1.6 };

const Paint: React.FC<{ on?: boolean }> = ({ on }) =>
  on ? (
    <meshStandardMaterial key="hl" color={HIGHLIGHT} emissive={HIGHLIGHT} emissiveIntensity={0.6} side={DS} />
  ) : (
    <meshStandardMaterial key="std" color={BODY} metalness={0.08} roughness={0.32} side={DS} />
  );

/** A control surface rotating about its hinge line (local z) by `angle`, optionally sliding back. */
const HingedPart: React.FC<{ part: Hinged; angle: number; slide?: number; on?: boolean }> = ({ part, angle, slide = 0, on }) => (
  <group position={part.mid} quaternion={part.quat}>
    <group position={[-slide, -slide * 0.2, 0]} rotation={[0, 0, angle]}>
      <mesh geometry={part.geometry}>
        <Paint on={on} />
      </mesh>
      {!on && part.decals ? <Stripes stripes={part.decals} /> : null}
    </group>
  </group>
);

/** Livery decal meshes (blue and sky-blue), drawn just above the skin. */
const Stripes: React.FC<{ stripes: Record<"blue" | "sky", THREE.BufferGeometry[]> }> = ({ stripes }) => (
  <>
    {(["blue", "sky"] as const).flatMap((c) =>
      stripes[c].map((g, i) => (
        <mesh key={`${c}${i}`} geometry={g}>
          <meshStandardMaterial color={c === "blue" ? BLUE : SKY_BLUE} metalness={0.1} roughness={0.3} side={DS} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      )),
    )}
  </>
);

/** Window rows with gaps for the doors. */
const WINDOW_ROWS: [number, number][] = [
  [1.86, 0.78],
  [0.44, -0.84],
  [-1.16, -2.02],
];
const WINDOW_STEP = 0.105;
const DOORS = [2.22, 0.61, -1.0, -2.2];

const windowPositions = (() => {
  const xs: number[] = [];
  for (const [from, to] of WINDOW_ROWS) for (let x = from; x >= to; x -= WINDOW_STEP) xs.push(x);
  return xs;
})();

/** A door outline drawn on the curved skin. */
const doorOutline = (x: number, side: number): [number, number, number][] => {
  const w = 0.075;
  const lo = -0.32;
  const hi = 0.5;
  const pts: [number, number, number][] = [];
  const at = (xx: number, vv: number) => fuselagePoint(xx, vv, side, 0.006).toArray() as [number, number, number];
  for (let i = 0; i <= 8; i++) pts.push(at(x - w, lo + ((hi - lo) * i) / 8));
  pts.push(at(x - w * 0.6, hi + 0.04), at(x + w * 0.6, hi + 0.04));
  for (let i = 8; i >= 0; i--) pts.push(at(x + w, lo + ((hi - lo) * i) / 8));
  pts.push(at(x + w * 0.6, lo - 0.04), at(x - w * 0.6, lo - 0.04), at(x - w, lo));
  return pts;
};

const Engine: React.FC<{ side: number; fan: number }> = ({ side, fan }) => {
  const geo = airplaneGeometry();
  return (
    <group position={[ENGINE.x, ENGINE.y, side * ENGINE.z]}>
      <mesh geometry={geo.nacelle}>
        <meshStandardMaterial color={BODY} metalness={0.1} roughness={0.3} side={DS} />
      </mesh>
      {/* Polished intake lip */}
      <mesh position={[0.655, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.322, 0.02, 10, 48]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Fan face, blades and spinner */}
      <mesh position={[0.3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.28, 40]} />
        <meshStandardMaterial color="#1c222c" side={DS} />
      </mesh>
      <group position={[0.36, 0, 0]} rotation={[fan, 0, 0]}>
        {Array.from({ length: 22 }, (_, i) => (
          <group key={i} rotation={[(i / 22) * Math.PI * 2, 0, 0]}>
            <mesh position={[0, 0.16, 0]} rotation={[0, 0.65, 0]}>
              <boxGeometry args={[0.075, 0.23, 0.008]} />
              <meshStandardMaterial color="#6f7886" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}
        <mesh position={[0.06, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.075, 0.17, 24]} />
          <meshStandardMaterial color="#e9edf3" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>
      {/* Core exhaust and plug */}
      <mesh position={[-0.62, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.17, 0.2, 32, 1, true]} />
        <meshStandardMaterial color={METAL} metalness={0.7} roughness={0.35} side={DS} />
      </mesh>
      <mesh position={[-0.82, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.13, 0.26, 24]} />
        <meshStandardMaterial color="#7d8593" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Pylon up into the wing */}
      <mesh position={[-0.3, 0.42, 0]}>
        <boxGeometry args={[1.0, 0.18, 0.05]} />
        <meshStandardMaterial color={BODY} metalness={0.08} roughness={0.32} />
      </mesh>
    </group>
  );
};

const Wheel: React.FC<{ position: [number, number, number]; glow: number }> = ({ position, glow }) => (
  <group position={position} rotation={[Math.PI / 2, 0, 0]}>
    <mesh>
      <cylinderGeometry args={[0.14, 0.14, 0.09, 24]} />
      <meshStandardMaterial color="#1b1e24" roughness={0.9} emissive="#ff4a1c" emissiveIntensity={glow} />
    </mesh>
    <mesh>
      <cylinderGeometry args={[0.075, 0.075, 0.095, 16]} />
      <meshStandardMaterial color="#c3c9d2" metalness={0.6} roughness={0.35} />
    </mesh>
  </group>
);

const Strut: React.FC<{ from: number; to: number; x: number; z: number }> = ({ from, to, x, z }) => (
  <mesh position={[x, (from + to) / 2, z]}>
    <cylinderGeometry args={[0.03, 0.03, Math.abs(from - to), 10]} />
    <meshStandardMaterial color="#b9c0ca" metalness={0.7} roughness={0.3} />
  </mesh>
);

/** A modern twin-engine widebody. The nose points along +x, up is +y, the right wing is +z. */
export const Airplane: React.FC<AirplaneProps> = ({
  aileron = 0,
  elevator = 0,
  rudder = 0,
  highlight = {},
  gear = 0,
  fan = 0,
  flaps = 0,
  spoilers = 0,
  brakes = 0,
  cabinGlow = 0,
}) => {
  const geo = airplaneGeometry();
  const gearScale = Math.max(0.001, gear);
  const wheelY = -GEAR_HEIGHT + 0.14; // wheel centres, relative to the plane origin
  return (
    <group>
      {/* Fuselage with painted livery */}
      <mesh geometry={geo.fuselage}>
        <meshStandardMaterial color={BODY} metalness={0.08} roughness={0.3} side={DS} />
      </mesh>
      {geo.livery.blue.map((g, i) => (
        <mesh key={`b${i}`} geometry={g}>
          <meshStandardMaterial color={BLUE} metalness={0.1} roughness={0.3} side={DS} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {geo.livery.sky.map((g, i) => (
        <mesh key={`s${i}`} geometry={g}>
          <meshStandardMaterial color={SKY_BLUE} metalness={0.1} roughness={0.3} side={DS} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {geo.livery.glass.map((g, i) => (
        <mesh key={`g${i}`} geometry={g}>
          <meshStandardMaterial color={GLASS} metalness={0.6} roughness={0.15} side={DS} polygonOffset polygonOffsetFactor={-2} />
        </mesh>
      ))}
      {/* Wing-to-body fairing */}
      <mesh position={[-0.15, -0.34, 0]} scale={[1.75, 0.2, 0.52]}>
        <sphereGeometry args={[1, 32, 16]} />
        <meshStandardMaterial color={BODY} metalness={0.08} roughness={0.32} />
      </mesh>

      {/* Passenger windows and door outlines */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {windowPositions.map((x) => (
            <mesh key={x} position={fuselagePoint(x, 0.3, side, 0.002)} scale={[0.75, 1.3, 0.3]}>
              <sphereGeometry args={[0.036, 10, 8]} />
              <meshStandardMaterial
                color={cabinGlow > 0 ? "#ffcf7a" : GLASS}
                emissive="#ffb347"
                emissiveIntensity={cabinGlow * 1.5}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>
          ))}
          {DOORS.map((x) => (
            <Line key={x} points={doorOutline(x, side)} color="#9aa3b2" lineWidth={1.4} />
          ))}
        </group>
      ))}

      {/* Wings */}
      <mesh geometry={geo.wingR}>
        <Paint />
      </mesh>
      <mesh geometry={geo.wingL}>
        <Paint />
      </mesh>
      <HingedPart part={geo.flap.right} angle={flaps * 0.55} slide={flaps * 0.18} on={highlight.flaps} />
      <HingedPart part={geo.flap.left} angle={flaps * 0.55} slide={flaps * 0.18} on={highlight.flaps} />
      <HingedPart part={geo.aileron.right} angle={aileron} on={highlight.ailerons} />
      <HingedPart part={geo.aileron.left} angle={-aileron} on={highlight.ailerons} />
      {geo.spoilers.map((sp, i) => (
        <group key={i}>
          <HingedPart part={sp.right} angle={-spoilers * 0.85} on={highlight.spoilers} />
          <HingedPart part={sp.left} angle={-spoilers * 0.85} on={highlight.spoilers} />
        </group>
      ))}

      {/* Engines */}
      <Engine side={1} fan={fan} />
      <Engine side={-1} fan={fan} />

      {/* Tail: stabilisers, elevators, fin and rudder */}
      <mesh geometry={geo.stabR}>
        <Paint />
      </mesh>
      <mesh geometry={geo.stabL}>
        <Paint />
      </mesh>
      <HingedPart part={geo.elevator.right} angle={-elevator} on={highlight.elevator} />
      <HingedPart part={geo.elevator.left} angle={-elevator} on={highlight.elevator} />
      <mesh geometry={geo.fin}>
        <Paint />
      </mesh>
      <Stripes stripes={geo.finStripes} />
      <HingedPart part={geo.rudder} angle={-rudder} on={highlight.rudder} />

      {/* Landing gear: twin-wheel nose gear, two four-wheel main bogies */}
      <group position={[0, -0.4, 0]} scale={[1, gearScale, 1]} visible={gear > 0.01}>
        <group position={[0, 0.4, 0]}>
          <Strut from={-0.4} to={wheelY} x={2.55} z={0} />
          <Wheel position={[2.55, wheelY, 0.075]} glow={0} />
          <Wheel position={[2.55, wheelY, -0.075]} glow={0} />
          {[-1, 1].map((side) => (
            <group key={side}>
              <Strut from={wingY(0.62) - 0.05} to={wheelY + 0.05} x={-0.25} z={side * 0.62} />
              <mesh position={[-0.25, wheelY + 0.03, side * 0.62]}>
                <boxGeometry args={[0.5, 0.04, 0.05]} />
                <meshStandardMaterial color="#b9c0ca" metalness={0.7} roughness={0.3} />
              </mesh>
              {[-0.17, 0.17].map((dx) =>
                [-0.085, 0.085].map((dz) => <Wheel key={`${dx}${dz}`} position={[-0.25 + dx, wheelY, side * 0.62 + dz]} glow={brakes * 1.6} />),
              )}
            </group>
          ))}
        </group>
      </group>
    </group>
  );
};
