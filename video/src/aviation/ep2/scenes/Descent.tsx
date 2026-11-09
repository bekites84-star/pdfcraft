import { Line } from "@react-three/drei";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Label3D, Stage, useGrow } from "../../lib/common";
import { InfoCard } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const START: [number, number] = [-9, 3.6];
const END: [number, number] = [8, -3.2];

/** Wide side view: the plane glides down a long, gentle slope toward a far-away runway. */
export const Descent: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = interpolate(frame, [10, scene.durationInFrames - 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = START[0] + (END[0] - START[0]) * k;
  const y = START[1] + (END[1] - START[1]) * k;
  const slope = Math.atan2(END[1] - START[1], END[0] - START[0]);
  const feet = Math.round(interpolate(k, [0, 1], [35000, 3000]) / 100) * 100;
  const idle = useGrow(wordFrame(scene, "down", 0, 90), 200);
  const path = useGrow(wordFrame(scene, "slope", 0, 200), 200);
  const dashes = Array.from({ length: 2 }, (_, i) => [START[0] + i * (END[0] - START[0]), START[1] + i * (END[1] - START[1]), 0] as [number, number, number]);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0, 0.4, 19], fov: 45 }} lookAt={[0, 0, 0]}>
        <CloudField speed={0.4} count={9} seed="ep2-desc" y={[-3, 7]} z={[-40, -20]} />
        {/* Ground and a tiny runway far ahead */}
        <mesh position={[0, -6.5, -10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 60]} />
          <meshStandardMaterial color="#6fb35f" roughness={1} />
        </mesh>
        <mesh position={[12.5, -6.45, -2]}>
          <boxGeometry args={[8, 0.05, 1.6]} />
          <meshStandardMaterial color="#4a4f58" />
        </mesh>
        <Line points={dashes} color="#ffffff" lineWidth={4} dashed dashSize={0.6} gapSize={0.4} transparent opacity={0.35 + 0.5 * path} />
        <group position={[x, y, 0]} rotation={[0, -0.15, slope * 0.5]} scale={1}>
          <Airplane fan={(frame / fps) * 8} />
        </group>
        <Label3D position={[x - 1.2, y - 1.9, 0]} text="engines: low power" background="#2f7cf6" opacity={idle} height={0.85} />
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>ALTITUDE</div>
        <div style={{ fontSize: 64, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums" }}>{feet.toLocaleString("en-US")} ft</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
