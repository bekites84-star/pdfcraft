import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Label3D } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { EngineStage } from "../common";

/** The whole cut-away engine, camera slowly swinging round; air goes in front, out back. */
export const Inside: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const a = interpolate(frame, [0, scene.durationInFrames], [0.35, -0.15]);
  const inAt = wordFrame(scene, "front", 0, 60);
  const outAt = wordFrame(scene, "back", 0, 120);
  const cut = ramp(frame, 0, 25);
  return (
    <AbsoluteFill>
      <EngineStage camera={[Math.sin(a) * 13, 2.2, Math.cos(a) * 13]} lookAt={[0.4, 0, 0]} engine={{ core: cut, bypass: cut * 0.6 }}>
        <Label3D position={[5.2, 2.4, 0]} text="air IN →" background="#2f7cf6" opacity={ramp(frame, inAt, inAt + 10)} height={0.85} />
        <Label3D position={[-5.4, 2.4, 0]} text="→ OUT, much faster" background="#e5484d" opacity={ramp(frame, outAt, outAt + 10)} height={0.85} />
      </EngineStage>
    </AbsoluteFill>
  );
};
