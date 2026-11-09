import { Line } from "@react-three/drei";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

/** Lightning: on for a few frames in every ~1.5 s window, at a random spot. */
const Lightning: React.FC = () => {
  const frame = useCurrentFrame();
  const window = 45;
  const n = Math.floor(frame / window);
  const at = Math.floor(random(`lt-${n}`) * (window - 6));
  const on = frame % window >= at && frame % window < at + 4 && random(`lt-on-${n}`) > 0.2;
  if (!on) return null;
  const x0 = (random(`lt-x-${n}`) - 0.5) * 24;
  const pts: [number, number, number][] = Array.from({ length: 7 }, (_, i) => [x0 + (random(`lt-j-${n}-${i}`) - 0.5) * 1.2, -4.5 - i * 0.9, -6]);
  return (
    <>
      <Line points={pts} color="#fff7b0" lineWidth={5} />
      <pointLight position={[x0, -6, -4]} intensity={180} distance={20} color="#e8ecff" />
    </>
  );
};

/** Calm sunshine up high, dark storm clouds and lightning far below. */
export const Weather: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const stormAt = wordFrame(scene, "storms", 0, 90);
  const smoothAt = wordFrame(scene, "smoother", 0, 200);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #1d63c4 0%, #4f97e0 45%, #6c7a90 75%, #3a4250 100%)" camera={{ position: [0, 1.5, 19] }} lookAt={[0, -1.5, 0]}>
        <CloudField speed={2.2} count={16} seed="storm" y={[-9, -5]} z={[-14, 2]} spread={44} color="#59606e" glow={0.04} size={1.5} />
        <Lightning />
        <group position={[0, 2.2 + Math.sin(t * 1.2) * 0.05, 0]} rotation={[0, -0.25, 0]} scale={0.85}>
          <Airplane fan={t * 30} />
        </group>
        <Label3D position={[0, 4.6, 0]} text="up here: smooth ✓" background="#22b35e" opacity={ramp(frame, smoothAt, smoothAt + 12)} height={0.7} />
        <Label3D position={[-6, -3.3, 2]} text="storms & bumps" background="#3a4250" opacity={ramp(frame, stormAt, stormAt + 12)} height={0.7} />
      </Stage>
    </AbsoluteFill>
  );
};
