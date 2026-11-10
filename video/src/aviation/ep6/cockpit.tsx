import * as THREE from "three";
import { Cloud } from "../lib/common";

/**
 * A simple airliner cockpit. The viewer faces +x (out of the windshield), up is +y, the
 * captain sits on the left (-z) and the first officer on the right (+z).
 */

type ScreenKind = "pfd" | "nd" | "eng";

const screenCache = new Map<ScreenKind, THREE.CanvasTexture>();
function screenTexture(kind: ScreenKind): THREE.CanvasTexture {
  const cached = screenCache.get(kind);
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 256;
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#05070b";
    g.fillRect(0, 0, 256, 256);
    if (kind === "pfd") {
      g.fillStyle = "#2f7fd6";
      g.fillRect(60, 30, 136, 100);
      g.fillStyle = "#8a5a2b";
      g.fillRect(60, 130, 136, 100);
      g.fillStyle = "#ffffff";
      g.fillRect(60, 128, 136, 4);
      g.fillStyle = "#ffd23f";
      g.fillRect(95, 126, 25, 8);
      g.fillRect(136, 126, 25, 8);
      g.fillStyle = "#3b4350";
      g.fillRect(10, 30, 40, 200);
      g.fillRect(206, 30, 40, 200);
      g.fillStyle = "#ffffff";
      g.font = "bold 18px monospace";
      g.fillText("250", 12, 135);
      g.fillText("350", 208, 135);
    } else if (kind === "nd") {
      g.strokeStyle = "#ffffff";
      g.lineWidth = 3;
      g.beginPath();
      g.arc(128, 220, 170, Math.PI * 1.2, Math.PI * 1.8);
      g.stroke();
      g.strokeStyle = "#e040fb";
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(128, 220);
      g.lineTo(150, 140);
      g.lineTo(110, 70);
      g.stroke();
      g.fillStyle = "#3fbf5a";
      g.beginPath();
      g.ellipse(190, 90, 24, 14, 0.4, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffd23f";
      g.beginPath();
      g.moveTo(128, 205);
      g.lineTo(118, 232);
      g.lineTo(138, 232);
      g.fill();
    } else {
      for (const cx of [80, 176]) {
        g.strokeStyle = "#ffffff";
        g.lineWidth = 4;
        g.beginPath();
        g.arc(cx, 80, 40, Math.PI * 0.8, Math.PI * 2.2);
        g.stroke();
        g.strokeStyle = "#3fbf5a";
        g.beginPath();
        g.moveTo(cx, 80);
        g.lineTo(cx + 30, 60);
        g.stroke();
      }
      g.fillStyle = "#3fbf5a";
      g.font = "bold 20px monospace";
      g.fillText("N1  92.4  92.6", 24, 170);
      g.fillText("FUEL  18.2 T", 40, 210);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  screenCache.set(kind, tex);
  return tex;
}

const Screen: React.FC<{ kind: ScreenKind; z: number; y?: number }> = ({ kind, z, y = 0.78 }) => (
  <mesh position={[0.73, y, z]} rotation={[0, -Math.PI / 2, 0]}>
    <planeGeometry args={[0.44, 0.44]} />
    <meshBasicMaterial map={screenTexture(kind)} toneMapped={false} />
  </mesh>
);

const PANEL = "#2a2f38";
const TRIM = "#3a404b";

const Yoke: React.FC<{ z: number; roll: number; push: number }> = ({ z, roll, push }) => (
  <group position={[0.32 + push * 0.08, 0.66, z]}>
    <mesh position={[0.1, -0.33, 0]} rotation={[0, 0, 0.35]}>
      <cylinderGeometry args={[0.035, 0.045, 0.7, 12]} />
      <meshStandardMaterial color="#20242b" />
    </mesh>
    <group rotation={[roll, 0, 0]}>
      <mesh rotation={[0, Math.PI / 2, Math.PI]}>
        <torusGeometry args={[0.16, 0.022, 10, 32, Math.PI]} />
        <meshStandardMaterial color="#15181d" />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 0.05, s * 0.16]}>
          <cylinderGeometry args={[0.03, 0.03, 0.14, 12]} />
          <meshStandardMaterial color="#15181d" />
        </mesh>
      ))}
      <mesh position={[0.02, -0.08, 0]}>
        <boxGeometry args={[0.05, 0.08, 0.14]} />
        <meshStandardMaterial color="#c9a227" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  </group>
);

const Seat: React.FC<{ z: number }> = ({ z }) => (
  <group position={[-0.75, 0, z]}>
    <mesh position={[0, 0.45, 0]}>
      <boxGeometry args={[0.5, 0.12, 0.5]} />
      <meshStandardMaterial color="#2c3a55" roughness={0.9} />
    </mesh>
    <mesh position={[-0.27, 0.8, 0]} rotation={[0, 0, -0.12]}>
      <boxGeometry args={[0.12, 0.62, 0.5]} />
      <meshStandardMaterial color="#2c3a55" roughness={0.9} />
    </mesh>
    <mesh position={[-0.31, 1.2, 0]} rotation={[0, 0, -0.12]}>
      <boxGeometry args={[0.1, 0.16, 0.3]} />
      <meshStandardMaterial color="#26324a" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.06, 0.08, 0.4, 12]} />
      <meshStandardMaterial color="#555c68" />
    </mesh>
  </group>
);

/** A pilot seen from behind: white shirt, gold stripes on the shoulders, cap. */
const Pilot: React.FC<{ z: number; stripes: number; headTurn?: number }> = ({ z, stripes, headTurn = 0 }) => (
  <group position={[-0.68, 0, z]}>
    <mesh position={[0, 0.98, 0]}>
      <boxGeometry args={[0.28, 0.55, 0.44]} />
      <meshStandardMaterial color="#f4f6fa" roughness={0.8} />
    </mesh>
    {[-1, 1].map((s) => (
      <group key={s} position={[0, 1.24, s * 0.17]}>
        {Array.from({ length: stripes }, (_, i) => (
          <mesh key={i} position={[0.1 - i * 0.045, 0.012, 0]}>
            <boxGeometry args={[0.025, 0.012, 0.09]} />
            <meshStandardMaterial color="#d4a72c" metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        <mesh position={[0.02, 0, 0]}>
          <boxGeometry args={[0.2, 0.012, 0.1]} />
          <meshStandardMaterial color="#141a2a" />
        </mesh>
      </group>
    ))}
    <group position={[0.02, 1.42, 0]} rotation={[0, headTurn, 0]}>
      <mesh>
        <sphereGeometry args={[0.12, 20, 16]} />
        <meshStandardMaterial color="#c68c5c" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.125, 0.12, 0.08, 20]} />
        <meshStandardMaterial color="#141a2a" />
      </mesh>
      <mesh position={[0.11, 0.06, 0]}>
        <boxGeometry args={[0.1, 0.015, 0.2]} />
        <meshStandardMaterial color="#141a2a" />
      </mesh>
      {/* Headset band */}
      <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.012, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#30343c" />
      </mesh>
    </group>
  </group>
);

export type CockpitProps = {
  yokeRoll?: number;
  yokePush?: number;
  /** 0 = idle, 1 = full power. */
  throttle?: number;
  pilots?: boolean;
  /** 0..1 glow on the autopilot button. */
  autopilot?: number;
};

export const Cockpit: React.FC<CockpitProps> = ({ yokeRoll = 0, yokePush = 0, throttle = 0.3, pilots = false, autopilot = 0 }) => (
  <group>
    {/* Outside: clouds far beyond the windshield */}
    {Array.from({ length: 8 }, (_, i) => (
      <Cloud key={i} seed={170 + i} position={[40 + (i % 3) * 12, -6 + (i % 2) * 2, -30 + i * 8.5]} scale={4} />
    ))}
    {/* Cabin lights */}
    <pointLight position={[-0.6, 1.9, 0]} intensity={4} distance={6} color="#fff4e0" />
    <pointLight position={[0.2, 1.4, 0]} intensity={2} distance={4} color="#dfe8ff" />
    {/* Floor */}
    <mesh position={[-0.4, -0.02, 0]}>
      <boxGeometry args={[2.8, 0.04, 3.3]} />
      <meshStandardMaterial color="#1b1f26" />
    </mesh>
    {/* Main instrument panel with screens */}
    <mesh position={[0.86, 0.72, 0]}>
      <boxGeometry args={[0.24, 0.8, 3.2]} />
      <meshStandardMaterial color={PANEL} roughness={0.8} />
    </mesh>
    <Screen kind="pfd" z={-1.2} />
    <Screen kind="nd" z={-0.7} />
    <Screen kind="eng" z={0} />
    <Screen kind="nd" z={0.7} />
    <Screen kind="pfd" z={1.2} />
    {/* Glareshield with the autopilot panel */}
    <mesh position={[0.78, 1.17, 0]}>
      <boxGeometry args={[0.5, 0.1, 3.2]} />
      <meshStandardMaterial color="#1c2027" roughness={0.9} />
    </mesh>
    <mesh position={[0.55, 1.16, 0]}>
      <boxGeometry args={[0.06, 0.08, 1.3]} />
      <meshStandardMaterial color={TRIM} />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[0.52, 1.16, -0.5 + i * 0.125]}>
        <boxGeometry args={[0.012, 0.035, 0.07]} />
        <meshStandardMaterial
          color={i === 4 ? "#3fbf5a" : "#9aa3b1"}
          emissive={i === 4 ? "#3fdf6a" : "#000000"}
          emissiveIntensity={i === 4 ? 0.3 + 1.5 * autopilot : 0}
        />
      </mesh>
    ))}
    {/* Windshield frame */}
    {[-1.55, 0, 1.55].map((z) => (
      <mesh key={z} position={[0.98, 1.6, z]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.08, 0.85, 0.08]} />
        <meshStandardMaterial color={TRIM} />
      </mesh>
    ))}
    <mesh position={[0.85, 2.02, 0]}>
      <boxGeometry args={[0.2, 0.08, 3.3]} />
      <meshStandardMaterial color={TRIM} />
    </mesh>
    {/* Side walls (lower) and window posts */}
    {[-1, 1].map((s) => (
      <group key={s}>
        <mesh position={[-0.3, 0.6, s * 1.65]}>
          <boxGeometry args={[2.6, 1.2, 0.06]} />
          <meshStandardMaterial color="#d9dde3" roughness={0.9} />
        </mesh>
        <mesh position={[-0.5, 1.6, s * 1.65]}>
          <boxGeometry args={[0.08, 0.85, 0.06]} />
          <meshStandardMaterial color={TRIM} />
        </mesh>
      </group>
    ))}
    {/* Ceiling and overhead panel */}
    <mesh position={[-0.3, 2.1, 0]}>
      <boxGeometry args={[2.4, 0.08, 3.3]} />
      <meshStandardMaterial color="#d9dde3" roughness={0.9} />
    </mesh>
    <mesh position={[0.2, 2.04, 0]}>
      <boxGeometry args={[1.0, 0.04, 1.0]} />
      <meshStandardMaterial color={PANEL} />
    </mesh>
    {Array.from({ length: 30 }, (_, i) => (
      <mesh key={i} position={[-0.2 + (i % 6) * 0.16, 2.015, -0.4 + Math.floor(i / 6) * 0.2]}>
        <boxGeometry args={[0.06, 0.02, 0.08]} />
        <meshStandardMaterial color={["#9aa3b1", "#3fbf5a", "#ffd23f", "#9aa3b1", "#e8ecf2"][i % 5] ?? "#9aa3b1"} emissive={i % 7 === 0 ? "#ffd23f" : "#000000"} emissiveIntensity={0.4} />
      </mesh>
    ))}
    {/* Centre pedestal with two throttle levers */}
    <mesh position={[-0.2, 0.3, 0]}>
      <boxGeometry args={[1.0, 0.6, 0.5]} />
      <meshStandardMaterial color={PANEL} />
    </mesh>
    {[-0.09, 0.09].map((z) => (
      <group key={z} position={[0.05, 0.6, z]} rotation={[0, 0, 0.55 - throttle * 1.0]}>
        <mesh position={[0, 0.13, 0]}>
          <boxGeometry args={[0.03, 0.26, 0.03]} />
          <meshStandardMaterial color="#9aa3b1" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.14]} />
          <meshStandardMaterial color="#20242b" />
        </mesh>
      </group>
    ))}
    <Yoke z={-0.62} roll={yokeRoll} push={yokePush} />
    <Yoke z={0.62} roll={yokeRoll} push={yokePush} />
    <Seat z={-0.62} />
    <Seat z={0.62} />
    {pilots ? (
      <>
        <Pilot z={-0.62} stripes={4} headTurn={0.15} />
        <Pilot z={0.62} stripes={3} headTurn={-0.1} />
      </>
    ) : null}
  </group>
);
