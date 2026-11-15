import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Stage } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { AltitudeTape } from "../instruments";

/** The plane climbs, levels, then descends; the altitude tape and climb arrow follow. */
export const Altitude: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const climbAt = wordFrame(scene, "climbing", 0, 150);
  const downAt = Math.max(climbAt + 30, wordFrame(scene, "down", 0, 200));
  const end = scene.durationInFrames;
  const keys = [0, 20, climbAt - 10, downAt - 5, end];
  const vals = [10000, 10000, 11400, 11600, 10900];
  const altAt = (f: number) => interpolate(f, keys, vals, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ft = altAt(frame);
  const fpm = (altAt(frame + 1) - altAt(frame - 1)) * (fps / 2) * 60;
  const nose = Math.max(-0.12, Math.min(0.15, fpm / 12000));
  const worldY = -(ft - 10000) / 120; // clouds slide down as we climb
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-1, 0.6, 15] }} lookAt={[-2.5, 0.4, 0]}>
        {Array.from({ length: 14 }, (_, i) => (
          <Cloud key={i} seed={210 + i} position={[((i * 7.3 - t * 3) % 60) + 25 - 30, worldY - 6 + (i % 4) * 4.5, -10 - (i % 3) * 5]} scale={1.3} />
        ))}
        <group position={[-3.5, 0, 0]} rotation={[0, 0, nose]} scale={0.8}>
          <Airplane fan={t * 30} />
        </group>
      </Stage>
      <div style={{ position: "absolute", right: 200, top: 190 }}>
        <AltitudeTape ft={ft} fpm={fpm} height={680} />
      </div>
    </AbsoluteFill>
  );
};
