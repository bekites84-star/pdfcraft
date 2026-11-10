import { Line } from "@react-three/drei";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Label3D, Stage } from "../../lib/common";
import { Mountain, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const PEAKS: [number, number, number, number][] = [
  [-14, -14, 5, 4],
  [-8, -10, 6.5, 5],
  [-2, -16, 4.5, 4],
  [3, -9, 7, 5.5],
  [9, -13, 5.5, 4.5],
  [14, -10, 6, 5],
];

/** A mountain range far below the cruising plane, with the gap between them marked. */
export const Safety: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const x = -3 + t * 0.5;
  const space = ramp(frame, wordFrame(scene, "space", 0, 200) - 10, wordFrame(scene, "space", 0, 200) + 10);
  const far = ramp(frame, wordFrame(scene, "far", 0, 60), wordFrame(scene, "far", 0, 60) + 12);
  const ground = -9;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0, 1, 26] }} lookAt={[0, -3, 0]}>
        {PEAKS.map(([px, pz, h, r], i) => (
          <Mountain key={i} position={[px, ground, pz]} height={h} radius={r} seed={i} />
        ))}
        <mesh position={[0, ground, -10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 40]} />
          <meshStandardMaterial color="#5c7a4f" roughness={1} />
        </mesh>
        {[-12, 6].map((cx, i) => (
          <Cloud key={i} seed={40 + i} position={[cx, -1, -12]} scale={1.3} />
        ))}
        <group position={[x, 4, 0]} rotation={[0, -0.2, 0]} scale={0.65}>
          <Airplane fan={t * 30} />
        </group>
        <Line points={[[x, 3.3, 0], [x, ground + 7, 0]]} color="#ffd84a" lineWidth={4} dashed dashSize={0.4} gapSize={0.3} transparent opacity={far} />
        <Label3D position={[x + 3.6, -0.5, 0]} text="lots of room below" background="#22b35e" opacity={far} height={1.1} />
        <Label3D position={[x, 6.4, 0]} text="time & space to fix problems" background="#2f7cf6" opacity={space} height={1.1} />
      </Stage>
    </AbsoluteFill>
  );
};
