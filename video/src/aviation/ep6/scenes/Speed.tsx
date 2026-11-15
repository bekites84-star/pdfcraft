import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { SpeedTape } from "../instruments";

const Tag: React.FC<{ show: number; color: string; children: React.ReactNode }> = ({ show, color, children }) => (
  <div style={{ opacity: show, background: color, color: "white", fontFamily: "system-ui", fontWeight: 900, fontSize: 40, padding: "10px 24px", borderRadius: 14, marginTop: 14, transform: `translateX(${(1 - show) * -30}px)` }}>
    {children}
  </div>
);

/** The speed tape scrolls as the plane slows down, speeds up, then settles. */
export const Speed: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const slowAt = Math.max(20, wordFrame(scene, "slow", 0, 90));
  const fastAt = Math.max(slowAt + 40, wordFrame(scene, "fast", 1, 180));
  const rightAt = Math.max(fastAt + 40, wordFrame(scene, "right", 0, 290));
  const kts = interpolate(frame, [0, slowAt, slowAt + 30, fastAt, fastAt + 30, rightAt, rightAt + 30], [250, 250, 128, 128, 345, 345, 260], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Clouds stream past faster when the plane is faster: integrate speed over time.
  let dist = 0;
  for (let f = 0; f < frame; f++) {
    dist += interpolate(f, [0, slowAt, slowAt + 30, fastAt, fastAt + 30, rightAt, rightAt + 30], [250, 250, 128, 128, 345, 345, 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) / fps / 40;
  }
  const slow = kts < 150 ? 1 : 0;
  const fast = kts > 325 ? 1 : 0;
  const right = ramp(frame, rightAt + 20, rightAt + 32);
  const span = 70;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [1.5, 1, 15] }} lookAt={[3.5, 0.5, 0]}>
        {Array.from({ length: 12 }, (_, i) => {
          const x = ((((i * 6.1 - dist) % span) + span) % span) - span / 2 + 8;
          return <Cloud key={i} seed={190 + i} position={[x, -3 + (i % 3) * 3.4, -12 - (i % 4) * 4]} scale={1.4} />;
        })}
        <group position={[5, 0.3, 0]} rotation={[0, 0, kts < 150 ? 0.12 : 0]} scale={0.8}>
          <Airplane fan={t * 30} />
        </group>
      </Stage>
      <div style={{ position: "absolute", left: 120, top: 220 }}>
        <SpeedTape kts={kts} height={620} />
      </div>
      <div style={{ position: "absolute", left: 380, top: 380 }}>
        <Tag show={slow} color="#e5484d">TOO SLOW: not enough lift</Tag>
        <Tag show={fast} color="#e5484d">TOO FAST: hard on the plane</Tag>
        <Tag show={right} color="#22b35e">JUST RIGHT ✓</Tag>
      </div>
    </AbsoluteFill>
  );
};
