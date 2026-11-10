import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, Cloud, Label3D, Stage } from "../../lib/common";
import { Mountain, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const loop = (x: number) => ((x % 1) + 1) % 1;

/** Three sources of bumpy air, left to right: rising heat, wind over mountains, a storm cloud. */
export const Causes: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const warmAt = wordFrame(scene, "warm", 0, 60);
  const mtnAt = wordFrame(scene, "mountains", 0, 140);
  const stormAt = wordFrame(scene, "storm", 0, 220);
  const warm = ramp(frame, warmAt - 10, warmAt + 10);
  const mtn = ramp(frame, mtnAt - 10, mtnAt + 10);
  const storm = ramp(frame, stormAt - 10, stormAt + 10);
  // Pan gently toward whichever cause is being talked about.
  const camX = interpolate(frame, [warmAt, mtnAt, stormAt], [-6, 0, 6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [camX, 2.5, 21], fov: 45 }} lookAt={[camX, 1.5, 0]}>
        <mesh position={[0, -3, -5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[80, 30]} />
          <meshStandardMaterial color="#79b65d" roughness={1} />
        </mesh>

        {/* 1. Sun-warmed ground: bubbles of warm air rise */}
        <mesh position={[-14, 6.5, -8]}>
          <sphereGeometry args={[1.6, 32, 16]} />
          <meshBasicMaterial color="#ffd23f" />
        </mesh>
        <mesh position={[-9, -2.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#e3b35d" emissive="#ff8a3d" emissiveIntensity={0.25 * warm} />
        </mesh>
        {Array.from({ length: 9 }, (_, i) => {
          const u = loop(t * 0.35 + random(`w${i}`));
          return (
            <mesh key={i} position={[-9 + (random(`wx${i}`) - 0.5) * 4, -2.6 + u * 9, (random(`wz${i}`) - 0.5) * 2]} scale={0.3 + u * 0.7}>
              <sphereGeometry args={[0.6, 16, 12]} />
              <meshStandardMaterial color="#ff9d4d" emissive="#ff7a1a" emissiveIntensity={0.4} transparent opacity={warm * (1 - u) * 0.7} />
            </mesh>
          );
        })}
        <Label3D position={[-9, 7.4, 0]} text="warm air rises" background="#f08a24" opacity={warm} height={0.95} />

        {/* 2. Wind over a mountain tumbles into eddies behind it */}
        <Mountain position={[1, -3, -1]} height={6.5} radius={4.5} seed={3} />
        {Array.from({ length: 4 }, (_, row) =>
          Array.from({ length: 12 }, (_, i) => {
            const u = loop(t * 0.3 + i / 12 + row * 0.07);
            const x = -4 + u * 11;
            const over = Math.max(0, 1 - Math.abs(x - 1) / 4);
            const lee = Math.max(0, Math.min(1, (x - 2) / 2));
            const y = -0.8 + row * 0.9 + over * 4.2 - lee * 2.2 + lee * Math.sin(u * 30 + t * 5 + row) * 0.7;
            return (
              <mesh key={`m${row}-${i}`} position={[x, y, 1.2]} scale={[2, 1, 1]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#d9ecff" emissiveIntensity={0.8} transparent opacity={mtn} />
              </mesh>
            );
          }),
        )}
        <Label3D position={[1, 7.4, 0]} text="wind over mountains" background="#51607a" opacity={mtn} height={0.95} />

        {/* 3. A towering storm cloud with strong up- and down-drafts */}
        {Array.from({ length: 6 }, (_, i) => (
          <Cloud key={i} seed={90 + i} position={[11 + (i % 2) * 0.6 - 0.3, -1.5 + i * 1.25, -1]} scale={1.05 + (i === 5 ? 0.5 : 0) - i * 0.04} color="#6a7282" glow={0.05} />
        ))}
        <Arrow origin={[9.2, -1.5, 2.5]} dir={[0, 1, 0]} length={5 * storm} color="#2f7cf6" progress={storm} thickness={0.14} />
        <Arrow origin={[12.8, 4.5, 2.5]} dir={[0, -1, 0]} length={5 * storm} color="#e5484d" progress={storm} thickness={0.14} />
        <Label3D position={[11, 8.8, 0]} text="storm clouds" background="#3a4250" opacity={storm} height={0.95} />
      </Stage>
    </AbsoluteFill>
  );
};
