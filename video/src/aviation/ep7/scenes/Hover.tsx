import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Label3D, Stage } from "../../lib/common";
import { Helicopter, SKID_HEIGHT } from "../../lib/Helicopter";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Downwash, Field, spin } from "../world";

/** Hovering over a field, grass rippling under the downwash. */
export const Hover: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const hoverAt = wordFrame(scene, "hover", 0, 100);
  const birdAt = wordFrame(scene, "hummingbird", 0, 150);
  const y = SKID_HEIGHT + 2.2 + Math.sin(t * 1.5) * 0.08;
  const a = t * 0.15;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [Math.sin(a) * 13, 3.6, Math.cos(a) * 13], fov: 42 }} lookAt={[0, 2.4, 0]}>
        <Field />
        <Downwash position={[0, 0, 0]} strength={1} />
        <group position={[0, y, 0]} rotation={[0, 0.3, Math.sin(t * 0.9) * 0.02]}>
          <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} />
        </group>
        <Label3D position={[0, y + 2.6, 0]} text="hovering in one spot" background="#22b35e" opacity={ramp(frame, hoverAt, hoverAt + 10)} height={0.7} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, birdAt - 10, birdAt + 5)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>JUST LIKE…</div>
        <div style={{ fontSize: 48, fontWeight: 800, color: "#0d2340" }}>🐦 a hummingbird</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
