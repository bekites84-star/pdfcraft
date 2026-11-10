import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { Ground, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const GLIDE = (3 * Math.PI) / 180; // a real 3° glide slope
const TOUCHDOWN_X = -22; // just past the runway threshold (runway starts at x = -30)
const SPEED = 5; // units per second

/** Chase view from behind: gear comes down and the plane rides a 3° slope to the runway. */
export const Approach: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const endX = TOUCHDOWN_X - 12;
  const x = endX - SPEED * (scene.durationInFrames / fps - t);
  const y = GEAR_HEIGHT + (TOUCHDOWN_X - x) * Math.tan(GLIDE);
  const gearAt = wordFrame(scene, "gear", 0, 40);
  const gear = ramp(frame, gearAt, gearAt + 40);
  const slopeAt = wordFrame(scene, "slope", 0, 180);
  const slope = ramp(frame, slopeAt, slopeAt + 20);
  const lineStart = x - 12;
  const lineLen = TOUCHDOWN_X - lineStart;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 10, y + 2.4, 4.5], fov: 45 }} lookAt={[x + 8, y - 1.2, 0]}>
        <CloudField speed={0.2} count={8} seed="ep2-app" y={[8, 14]} z={[-60, -30]} spread={160} />
        <Ground />
        {/* Approach lights before the runway */}
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[-32 - i * 3, 0.2, 0]}>
            <sphereGeometry args={[0.18, 10, 8]} />
            <meshStandardMaterial color="#fff6c9" emissive="#ffe27a" emissiveIntensity={1.5} />
          </mesh>
        ))}
        {/* The 3° slope, drawn as a glowing ribbon down to the touchdown point */}
        <group position={[TOUCHDOWN_X, 0.05, 0]} rotation={[0, 0, Math.PI - GLIDE]}>
          <mesh position={[lineLen / 2, 0, 0]} visible={slope > 0.01}>
            <boxGeometry args={[lineLen * slope, 0.06, 0.06]} />
            <meshStandardMaterial color="#22b35e" emissive="#22b35e" emissiveIntensity={0.8} transparent opacity={0.85} />
          </mesh>
        </group>
        <group position={[x, y, 0]} rotation={[0, 0, 0.03]}>
          <Airplane fan={t * 10} gear={gear} flaps={1} />
        </group>
        <Label3D position={[x + 0.5, y - 2.0, 1]} text="gear DOWN" background="#0d2340" opacity={gear} height={0.6} />
        <Label3D position={[x + 14, y - 0.4, 0]} text="3° slope" background="#22b35e" opacity={slope} height={1.4} />
      </Stage>
    </AbsoluteFill>
  );
};
