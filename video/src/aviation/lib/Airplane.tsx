import { useMemo } from "react";
import * as THREE from "three";

const BODY = "#f4f6fb";
const ACCENT = "#1f6feb";
const DARK = "#1b2333";
const HIGHLIGHT = "#ffcc00";

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

const surface = (on: boolean | undefined) =>
  on ? { color: HIGHLIGHT, emissive: HIGHLIGHT, emissiveIntensity: 0.6 } : { color: BODY, emissive: "#000000", emissiveIntensity: 0 };

/** Builds a flat plate from an outline in (x, z) and a thickness along y, centred on y = 0. */
function plate(outline: [number, number][], thickness: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(outline.map(([x, z]) => new THREE.Vector2(x, z)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false });
  // Shape is in XY; rotate so shape-Y becomes world Z, then centre the thickness on y = 0.
  g.rotateX(Math.PI / 2);
  g.translate(0, thickness / 2, 0);
  return g;
}

/** A simple airliner built from primitives. The nose points along +x, up is +y, the right wing is +z. */
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
  const geo = useMemo(() => {
    const wing = plate([[1.0, 0.0], [-0.3, 3.7], [-1.0, 3.7], [-1.0, -3.7], [-0.3, -3.7], [1.0, 0.0]], 0.1);
    const stab = plate([[-2.5, 0.0], [-3.05, 1.5], [-3.2, 1.5], [-3.2, -1.5], [-3.05, -1.5], [-2.5, 0.0]], 0.06);
    const finShape = new THREE.Shape([new THREE.Vector2(-2.1, 0.3), new THREE.Vector2(-3.1, 1.9), new THREE.Vector2(-3.4, 1.9), new THREE.Vector2(-3.4, 0.3)]);
    const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.08, bevelEnabled: false });
    fin.translate(0, 0, -0.04);
    return { wing, stab, fin };
  }, []);

  const s = (on?: boolean) => surface(on);
  const gearScale = Math.max(0.001, gear);

  return (
    <group>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 4.6, 32]} />
        <meshStandardMaterial color={BODY} metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[2.4, 0, 0]} scale={[1.8, 1, 1]}>
        <sphereGeometry args={[0.45, 32, 16, 0, Math.PI * 2, 0, Math.PI]} />
        <meshStandardMaterial color={BODY} metalness={0.2} roughness={0.35} />
      </mesh>
      <mesh position={[-2.85, 0.12, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.45, 0.14, 1.3, 32]} />
        <meshStandardMaterial color={BODY} metalness={0.2} roughness={0.35} />
      </mesh>
      {/* Blue belly stripe */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0.1, 0, 0]} scale={[1.01, 1, 1.01]}>
        <cylinderGeometry args={[0.452, 0.452, 4.6, 32, 1, true, Math.PI * 0.62, Math.PI * 0.76]} />
        <meshStandardMaterial color={ACCENT} side={THREE.DoubleSide} />
      </mesh>
      {/* Cockpit windows */}
      <mesh position={[2.95, 0.2, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.35, 0.12, 0.62]} />
        <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.15} />
      </mesh>
      {/* Passenger windows */}
      {[-1, 1].map((side) =>
        Array.from({ length: 12 }, (_, i) => (
          <mesh key={`${side}-${i}`} position={[1.8 - i * 0.32, 0.12, side * 0.445]} scale={[1, 1.3, 0.3]}>
            <sphereGeometry args={[0.065, 8, 8]} />
            <meshStandardMaterial color={DARK} />
          </mesh>
        )),
      )}

      {/* Wings, with the inner flaps fixed and the outer ailerons hinged on the trailing edge */}
      <group position={[0, -0.22, 0]}>
        <mesh geometry={geo.wing}>
          <meshStandardMaterial color={BODY} metalness={0.25} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side}>
            {/* Flap: slides back and tilts down */}
            <group position={[-1.0 - flaps * 0.22, -flaps * 0.05, side * 1.35]} rotation={[0, 0, flaps * 0.55]}>
              <mesh position={[-0.18, 0, 0]}>
                <boxGeometry args={[0.36, 0.06, 1.8]} />
                <meshStandardMaterial {...s(highlight.flaps)} />
              </mesh>
            </group>
            {/* Spoilers: panels on top of the wing that hinge up */}
            {[0.95, 2.15].map((z) => (
              <group key={z} position={[-0.42, 0.06, side * z]} rotation={[0, 0, -spoilers * 0.85]}>
                <mesh position={[-0.2, 0, 0]}>
                  <boxGeometry args={[0.4, 0.025, 0.75]} />
                  <meshStandardMaterial {...(highlight.spoilers ? s(true) : { color: "#dfe4ec" })} />
                </mesh>
              </group>
            ))}
            <group position={[-1.0, 0, side * 2.95]} rotation={[0, 0, side * aileron]}>
              <mesh position={[-0.2, 0, 0]}>
                <boxGeometry args={[0.4, 0.06, 1.3]} />
                <meshStandardMaterial {...s(highlight.ailerons)} />
              </mesh>
            </group>
            {/* Winglet */}
            <mesh position={[-0.75, 0.25, side * 3.68]} rotation={[0, 0, -0.35]}>
              <boxGeometry args={[0.45, 0.5, 0.05]} />
              <meshStandardMaterial color={ACCENT} />
            </mesh>
            {/* Engine */}
            <group position={[0.75, -0.42, side * 1.6]}>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.3, 0.26, 1.1, 32, 1, true]} />
                <meshStandardMaterial color="#c9d3e3" metalness={0.5} roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
              <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[0.29, 0.03, 8, 32]} />
                <meshStandardMaterial color={ACCENT} />
              </mesh>
              <group position={[0.4, 0, 0]} rotation={[fan, 0, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <coneGeometry args={[0.08, 0.15, 16]} />
                  <meshStandardMaterial color="#e8ecf3" />
                </mesh>
                {Array.from({ length: 8 }, (_, i) => (
                  <mesh key={i} rotation={[(i / 8) * Math.PI * 2, 0, 0]} position={[0, 0, 0]}>
                    <boxGeometry args={[0.02, 0.5, 0.07]} />
                    <meshStandardMaterial color="#59647a" metalness={0.7} roughness={0.3} />
                  </mesh>
                ))}
              </group>
              <mesh position={[-0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.25, 0.25, 0.6, 24]} />
                <meshStandardMaterial color={DARK} />
              </mesh>
              {/* Pylon */}
              <mesh position={[-0.05, 0.25, 0]}>
                <boxGeometry args={[0.6, 0.25, 0.06]} />
                <meshStandardMaterial color={BODY} />
              </mesh>
            </group>
          </group>
        ))}
      </group>

      {/* Horizontal tail with elevators */}
      <group position={[0, 0.15, 0]}>
        <mesh geometry={geo.stab}>
          <meshStandardMaterial color={BODY} />
        </mesh>
        {[-1, 1].map((side) => (
          <group key={side} position={[-3.2, 0, side * 0.9]} rotation={[0, 0, -elevator]}>
            <mesh position={[-0.15, 0, 0]}>
              <boxGeometry args={[0.3, 0.04, 1.15]} />
              <meshStandardMaterial {...s(highlight.elevator)} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Vertical fin with rudder */}
      <mesh geometry={geo.fin}>
        <meshStandardMaterial color={ACCENT} />
      </mesh>
      <group position={[-3.4, 1.1, 0]} rotation={[0, -rudder, 0]}>
        <mesh position={[-0.16, 0, 0]}>
          <boxGeometry args={[0.32, 1.5, 0.06]} />
          <meshStandardMaterial {...(highlight.rudder ? s(true) : { color: ACCENT })} />
        </mesh>
      </group>

      {/* Landing gear */}
      <group scale={[1, gearScale, 1]} position={[0, -0.4, 0]} visible={gear > 0.01}>
        {[
          [2.0, 0],
          [-0.4, 0.45],
          [-0.4, -0.45],
        ].map(([x, z], i) => (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, -0.18, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.36, 8]} />
              <meshStandardMaterial color="#8892a6" />
            </mesh>
            <mesh position={[0, -0.38, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.14, 16]} />
              <meshStandardMaterial color="#20242c" emissive="#ff4a1c" emissiveIntensity={i === 0 ? 0 : brakes * 1.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

/** Distance from the plane's origin to the bottom of its wheels, with the gear down. */
export const GEAR_HEIGHT = 0.93;
