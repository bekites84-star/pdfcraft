import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { BAG_COLORS, Suitcase, useT } from "../airport";

/** Branch belts leave the main belt at these x positions, each heading to a different gate. */
const BRANCHES = [
  { x: -1.5, gate: "GATE 7", color: "#e5484d" },
  { x: 2.0, gate: "GATE 12", color: "#2f7cf6" },
  { x: 5.5, gate: "GATE 21", color: "#22b35e" },
];
const BELT_Y = 1;

const Belt: React.FC<{ from: [number, number]; to: [number, number] }> = ({ from, to }) => {
  const dx = to[0] - from[0];
  const dz = to[1] - from[1];
  const len = Math.hypot(dx, dz);
  return (
    <group position={[(from[0] + to[0]) / 2, BELT_Y - 0.08, (from[1] + to[1]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
      <mesh>
        <boxGeometry args={[len, 0.1, 0.5]} />
        <meshStandardMaterial color="#2a2f38" />
      </mesh>
      {[-0.28, 0.28].map((z) => (
        <mesh key={z} position={[0, 0.06, z]}>
          <boxGeometry args={[len, 0.08, 0.05]} />
          <meshStandardMaterial color="#9aa3b1" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
};

/** A baggage hall: a scanner reads each tag and branch belts send bags to their gates. */
export const Bags: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const tagAt = wordFrame(scene, "tag", 0, 40);
  const scanAt = wordFrame(scene, "scanners", 0, 100);
  const mazeAt = wordFrame(scene, "maze", 0, 160);
  const planeAt = wordFrame(scene, "plane", 0, 230);
  const laser = 0.6 + 0.4 * Math.sin(t * 20);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #3b4350 0%, #5c6573 100%)" camera={{ position: [-1.2, 6.6, 7.6], fov: 47 }} lookAt={[-0.4, 0.6, -1.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[60, 40]} />
          <meshStandardMaterial color="#7d848e" />
        </mesh>
        <Belt from={[-9, 0]} to={[9, 0]} />
        {BRANCHES.map((b) => (
          <group key={b.gate}>
            <Belt from={[b.x, 0]} to={[b.x + 2.5, -6]} />
            <mesh position={[b.x + 2.6, 0.9, -6.4]}>
              <boxGeometry args={[1.6, 1.8, 0.2]} />
              <meshStandardMaterial color={b.color} />
            </mesh>
            <Label3D position={[b.x + 2.6, 2.3, -6.4]} text={b.gate} background={b.color} height={0.6} opacity={ramp(frame, planeAt - 10, planeAt + 5)} />
          </group>
        ))}
        {/* Scanner arch with a flickering red laser */}
        <group position={[-4.5, BELT_Y, 0]}>
          {[-0.45, 0.45].map((z) => (
            <mesh key={z} position={[0, 0.5, z]}>
              <boxGeometry args={[0.25, 1.1, 0.12]} />
              <meshStandardMaterial color="#d9dee5" />
            </mesh>
          ))}
          <mesh position={[0, 1.05, 0]}>
            <boxGeometry args={[0.25, 0.15, 1.05]} />
            <meshStandardMaterial color="#d9dee5" />
          </mesh>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[0.02, 0.02, 0.9]} />
            <meshBasicMaterial color="#ff3030" transparent opacity={laser} />
          </mesh>
        </group>
        {/* Bags: along the main belt, then each turns off at its gate's branch */}
        {Array.from({ length: 16 }, (_, i) => {
          const branch = BRANCHES[Math.floor(random(`bg${i}`) * BRANCHES.length)] ?? BRANCHES[0];
          if (!branch) return null;
          const s = (((t * 1.6 + i * 1.7) % 22) + 22) % 22; // distance travelled
          const mainLen = branch.x + 9;
          let p: [number, number];
          let rot = 0;
          if (s < mainLen) {
            p = [-9 + s, 0];
          } else {
            const k = Math.min(1, (s - mainLen) / 6.5);
            p = [branch.x + 2.5 * k, -6 * k];
            rot = Math.atan2(6, 2.5);
          }
          if (p[0] > 9) return null;
          return <Suitcase key={i} position={[p[0], BELT_Y + 0.11, p[1]]} rotation={rot} color={BAG_COLORS[i % BAG_COLORS.length] ?? "#e5484d"} />;
        })}
        <Label3D position={[-3.4, 2.8, 1.2]} text="tag with a barcode" background="#0d2340" opacity={ramp(frame, tagAt, tagAt + 10)} height={0.55} />
        <Label3D position={[-4.5, 2.6, 0]} text="scanner" background="#e5484d" opacity={ramp(frame, scanAt, scanAt + 10)} height={0.55} />
        <Label3D position={[3, 2.2, 1.2]} text="a maze of belts" background="#2f7cf6" opacity={ramp(frame, mazeAt, mazeAt + 10)} height={0.55} />
      </Stage>
      {/* Close-up of a bag tag */}
      <div style={{ position: "absolute", right: 70, top: 60, opacity: ramp(frame, tagAt - 5, tagAt + 8), fontFamily: "system-ui", background: "#fffdf5", borderRadius: 18, padding: "18px 26px", boxShadow: "0 12px 30px rgba(0,0,0,0.35)", width: 360 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#51607a" }}>BAG TAG</div>
        <div style={{ fontSize: 56, fontWeight: 900, color: "#0d2340", letterSpacing: 2 }}>CLD · 12</div>
        <svg width={300} height={70}>
          {Array.from({ length: 46 }, (_, i) => (
            <rect key={i} x={i * 6.4} y={0} width={random(`bc${i}`) > 0.5 ? 4 : 2} height={70} fill="#111" />
          ))}
        </svg>
      </div>
    </AbsoluteFill>
  );
};
