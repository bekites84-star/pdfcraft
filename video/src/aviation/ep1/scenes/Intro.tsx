import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, useGrow } from "../../lib/common";
import type { SceneTimeline } from "../../lib/timeline";

export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const x = interpolate(frame, [0, scene.durationInFrames], [-4.5, 3.5]);
  const title = useGrow(8, 12);
  const sub = useGrow(30, 200);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0, -1.5, 15] }} lookAt={[0, 0.5, 0]}>
        <CloudField speed={3} count={14} seed="intro" />
        <group position={[x, -1.6 + Math.sin(t * 1.4) * 0.15, 0]} rotation={[0.18 + Math.sin(t) * 0.04, -0.55, 0.06]} scale={0.95}>
          <Airplane fan={t * 30} />
        </group>
      </Stage>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            fontSize: 118,
            fontWeight: 900,
            color: "white",
            textShadow: "0 8px 30px rgba(10,40,90,0.45)",
            transform: `scale(${0.6 + 0.4 * title})`,
            opacity: title,
          }}
        >
          How Do Airplanes Fly?
        </div>
        <div style={{ fontSize: 46, fontWeight: 700, color: "#eaf4ff", marginTop: 12, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>
          Flying, made simple ✈️
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
