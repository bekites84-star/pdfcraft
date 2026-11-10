import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, Label3D, Stage } from "../../lib/common";
import { Helicopter, SKID_HEIGHT, TAIL_ROTOR } from "../../lib/Helicopter";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Field, spin } from "../world";

/** A red curved arrow around the helicopter showing which way the body is turning. */
const SpinArrow: React.FC<{ show: number; clockwise: boolean }> = ({ show, clockwise }) => {
  if (show <= 0.01) return null;
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh rotation={[0, 0, clockwise ? -0.5 : 0.5]}>
        <torusGeometry args={[5.6, 0.12, 8, 64, Math.PI * 1.2]} />
        <meshBasicMaterial color="#e5484d" transparent opacity={0.9 * show} />
      </mesh>
    </group>
  );
};

/** Without the tail rotor the body spins; with it, the body holds still; the pedals turn it. */
export const TailRotor: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const spinAt = wordFrame(scene, "spin", 0, 70);
  const tailAt = Math.max(spinAt + 20, wordFrame(scene, "tail", 0, 150));
  const turnAt = Math.max(tailAt + 40, wordFrame(scene, "turn", 0, 250));
  const tailOn = ramp(frame, tailAt - 5, tailAt + 20);
  // Yaw rate: the body drifts clockwise (negative) until the tail rotor catches it; pedals swing it.
  const rate = (f: number) =>
    -interpolate(f, [10, spinAt + 20], [0, 1.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
      (1 - interpolate(f, [tailAt, tailAt + 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })) +
    (f > turnAt ? Math.sin(((f - turnAt) / fps) * 2.2) * 0.9 : 0);
  let yaw = 0;
  for (let f = 0; f < frame; f++) yaw += rate(f) / fps;
  const spinning = ramp(frame, spinAt - 10, spinAt + 10) * (1 - tailOn);
  const y = SKID_HEIGHT + 2.6;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0.01, 17, 8], fov: 45 }} lookAt={[0, 1.5, 0]}>
        <Field />
        <group position={[0, y, 0]}>
          <SpinArrow show={spinning} clockwise />
          <group rotation={[0, yaw, 0]}>
            <Helicopter rotor={spin(t)} tail={spin(t, 40) * tailOn} blur={1} highlight={{ tailRotor: tailOn > 0.5 && frame < turnAt }} />
            <Arrow origin={[TAIL_ROTOR[0], TAIL_ROTOR[1], 0.5]} dir={[0, 0, 1]} length={2} color="#2f7cf6" progress={tailOn * (frame < turnAt + 40 ? 1 : 0)} label="push" labelOffset={[0, 0.6, 0.4]} thickness={0.1} labelHeight={0.6} />
          </group>
          <Label3D position={[6.2, 2.5, -1]} text="body spins the other way!" background="#e5484d" opacity={spinning} height={0.8} />
          <Label3D position={[6.2, 2.5, -1]} text="tail rotor stops the spin ✓" background="#2f7cf6" opacity={tailOn * (1 - ramp(frame, turnAt - 5, turnAt + 5))} height={0.8} />
          <Label3D position={[6.2, 2.5, -1]} text="pedals: turn left & right" background="#22b35e" opacity={ramp(frame, turnAt - 5, turnAt + 5)} height={0.8} />
        </group>
      </Stage>
    </AbsoluteFill>
  );
};
