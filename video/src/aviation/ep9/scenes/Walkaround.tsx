import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane, ENGINE } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, PARKED_Y, Person } from "../airport";

/** A pilot circles the plane with a torch; ticks appear at the tyres, engines and flaps. */
export const Walkaround: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const tyresAt = wordFrame(scene, "tyres", 0, 80);
  const engAt = wordFrame(scene, "engines", 0, 120);
  const flapsAt = wordFrame(scene, "flaps", 0, 170);
  // Walk an ellipse around the plane, starting at the nose, going down the right side.
  const a = -0.3 + (frame / scene.durationInFrames) * 2.9; // nose → right side → tail, facing the camera
  const px = Math.cos(a) * 4.3;
  const pz = Math.sin(a) * 4.6;
  const heading = -(a + Math.PI / 2);
  const cam = 0.4 + (frame / scene.durationInFrames) * 0.8;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [Math.cos(cam) * 9.5, 5.5, Math.sin(cam) * 9.5], fov: 45 }} lookAt={[0, 0.6, 0]}>
        <Apron bridge={false} />
        <group position={[0, PARKED_Y, 0]}>
          <Airplane gear={1} />
        </group>
        <Person position={[px, 0, pz]} heading={heading} walk={t} pilot scale={0.55} />
        <Label3D position={[-0.25, 0.25, 1.4]} text="tyres ✓" background="#22b35e" opacity={ramp(frame, tyresAt, tyresAt + 10)} height={0.42} />
        <Label3D position={[ENGINE.x + 0.4, PARKED_Y + ENGINE.y - 0.15, ENGINE.z + 1.0]} text="engines ✓" background="#22b35e" opacity={ramp(frame, engAt, engAt + 10)} height={0.42} />
        <Label3D position={[-1.4, PARKED_Y + 0.3, 3.0]} text="flaps ✓" background="#22b35e" opacity={ramp(frame, flapsAt, flapsAt + 10)} height={0.42} />
      </Stage>
    </AbsoluteFill>
  );
};
