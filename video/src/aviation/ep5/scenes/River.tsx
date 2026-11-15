import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { bump } from "../shake";

const SPAN = 26;
const ROWS = 9;
const PER_ROW = 22;
/** 0 in the smooth left half, 1 in the swirling right half. */
const rough = (x: number) => Math.min(1, Math.max(0, (x + 1) / 3));

/** Flowing air: straight lines on the left, swirls and eddies on the right. */
export const River: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const smoothAt = wordFrame(scene, "smooth", 0, 90);
  const swirlAt = wordFrame(scene, "swirls", 0, 180);
  const px = -10 + (frame / scene.durationInFrames) * 19;
  const r = rough(px);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #2f6fc4 0%, #5f9be0 60%, #a9cdf2 100%)" camera={{ position: [0, 0, 18] }} lookAt={[0, 0, 0]}>
        {Array.from({ length: ROWS }, (_, row) => {
          const y0 = -4.8 + (row / (ROWS - 1)) * 9.6;
          return Array.from({ length: PER_ROW }, (_, i) => {
            const x = ((((i / PER_ROW) * SPAN + t * 3.2 + row * 0.9) % SPAN) + SPAN) % SPAN - SPAN / 2;
            const k = rough(x);
            const y = y0 + k * (Math.sin(x * 1.7 + t * 4 + row) * 0.55 + Math.sin(x * 0.8 - t * 2.5 + row * 2) * 0.35);
            return (
              <mesh key={`${row}-${i}`} position={[x, y, -2]} scale={[2.6 - k * 1.3, 1, 1]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#ffffff" emissive="#d9ecff" emissiveIntensity={0.8} />
              </mesh>
            );
          });
        })}
        {/* Eddies: rings of dots spinning in the rough air */}
        {[
          [4.5, 2.2, 1.3],
          [7.5, -1.5, 1.6],
          [10.5, 2.8, 1.1],
          [5.5, -3.6, 1.0],
        ].map(([cx, cy, rad], e) =>
          Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2 + t * (e % 2 ? -2.6 : 2.2);
            return (
              <mesh key={`e${e}-${i}`} position={[(cx ?? 0) + Math.cos(a) * (rad ?? 1), (cy ?? 0) + Math.sin(a) * (rad ?? 1), -1.8]}>
                <sphereGeometry args={[0.09, 8, 6]} />
                <meshStandardMaterial color="#fff3c4" emissive="#ffe08a" emissiveIntensity={0.6} />
              </mesh>
            );
          }),
        )}
        <group position={[px, 0.2 + bump(t) * 0.45 * r, 0]} rotation={[bump(t, 4) * 0.12 * r, -0.15, bump(t, 9) * 0.08 * r]} scale={0.55}>
          <Airplane fan={t * 30} wingFlex={bump(t, 2) * 0.04 * r} />
        </group>
        <Label3D position={[-6, 4.4, 0]} text="smooth air = smooth ride" background="#22b35e" opacity={ramp(frame, smoothAt, smoothAt + 12)} height={0.85} />
        <Label3D position={[7, 4.4, 0]} text="swirling air = bumps!" background="#e5484d" opacity={ramp(frame, swirlAt, swirlAt + 12)} height={0.85} />
      </Stage>
    </AbsoluteFill>
  );
};
