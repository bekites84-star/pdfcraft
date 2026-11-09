import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { followCurve, smoothPath } from "../../lib/path";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const STORM: [number, number] = [26, 0];
const ROUTE = smoothPath([
  [0, 0, 0],
  [12, 0, 0],
  [20, 0, 8],
  [32, 0, 9],
  [40, 0, 2],
  [52, 0, 0],
]);

/** The radar shows a storm ahead; the plane detours around it, then the seatbelt sign comes on. */
export const Radar: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const radarAt = wordFrame(scene, "radar", 0, 30);
  const beltAt = wordFrame(scene, "seatbelt", 0, 200);
  const radar = ramp(frame, radarAt - 5, radarAt + 10);
  const belt = ramp(frame, beltAt - 6, beltAt + 4);
  const u = Math.min(0.97, (frame / scene.durationInFrames) * 1.05);
  const pose = followCurve(ROUTE, u, 12, 0.45);
  const [px, py, pz] = pose.position;
  const sweep = (t * 2.2) % (Math.PI * 2);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #2c5fa8 0%, #5f93d6 60%, #9cc3ee 100%)" camera={{ position: [24 + px * 0.15, 46, 24], fov: 45 }} lookAt={[26 + px * 0.1, -1, 3]}>
        {/* Storm cell: dark cloud tower with radar colours painted below */}
        {Array.from({ length: 5 }, (_, i) => (
          <Cloud key={i} seed={110 + i} position={[STORM[0] + (i % 2) * 1.2, -1 + i * 1.3, STORM[1] - 1 + (i % 3)]} scale={2.1 - i * 0.15} color="#5d6676" glow={0.05} />
        ))}
        {[
          [4.2, "#3fbf5a"],
          [2.8, "#f2d23a"],
          [1.4, "#e5484d"],
        ].map(([r, c], i) => (
          <mesh key={i} position={[STORM[0], -2.5 + i * 0.01, STORM[1]]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[r as number, 40]} />
            <meshBasicMaterial color={c as string} transparent opacity={0.75 * radar} />
          </mesh>
        ))}
        {/* Radar fan in front of the plane, with a sweeping line */}
        <group position={[px, py - 1.2, pz]} rotation={[0, pose.yaw, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[22, 48, -Math.PI / 3, (Math.PI * 2) / 3]} />
            <meshBasicMaterial color="#3df58f" transparent opacity={0.12 * radar} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, -Math.PI / 3 + ((Math.sin(sweep) + 1) / 2) * ((Math.PI * 2) / 3)]} position={[0, 0.02, 0]}>
            <planeGeometry args={[22, 0.12]} />
            <meshBasicMaterial color="#3df58f" transparent opacity={0.7 * radar} />
          </mesh>
        </group>
        <group position={pose.position} rotation={[0, pose.yaw, 0]}>
          <group rotation={[pose.bank, 0, 0]} scale={1.4}>
            <Airplane fan={t * 30} aileron={-pose.bank * 0.4} />
          </group>
        </group>
        <Label3D position={[STORM[0], 7.5, STORM[1]]} text="storm on the radar" background="#e5484d" opacity={radar} height={2} />
      </Stage>
      {/* The seatbelt sign */}
      <AbsoluteFill style={{ alignItems: "flex-end", padding: 56 }}>
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 44,
            fontWeight: 900,
            letterSpacing: 2,
            padding: "22px 36px",
            borderRadius: 22,
            background: belt > 0.5 ? "#2a1d00" : "#1b1f27",
            color: belt > 0.5 ? "#ffcf3f" : "#4a505c",
            boxShadow: belt > 0.5 ? "0 0 40px rgba(255,190,40,0.8), inset 0 0 18px rgba(255,190,40,0.5)" : "0 8px 24px rgba(0,0,0,0.3)",
            border: "4px solid #3a3f4a",
            transform: `scale(${1 + 0.08 * Math.sin(Math.min(1, belt) * Math.PI)})`,
          }}
        >
          🔔 FASTEN SEAT BELT
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
