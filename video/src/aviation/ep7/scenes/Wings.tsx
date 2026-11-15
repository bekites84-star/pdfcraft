import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, CloudField, FORCE_COLORS, Label3D, Stage } from "../../lib/common";
import { Helicopter, ROTOR_Y } from "../../lib/Helicopter";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

/** The rotor turns slowly so you can see the blades, then whirls up; air is pushed down; lift. */
export const Wings: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const wingsAt = wordFrame(scene, "wings", 0, 70);
  const whirlAt = wordFrame(scene, "whirl", 0, 130);
  const downAt = wordFrame(scene, "down", 0, 180);
  const upAt = wordFrame(scene, "up", 0, 290);
  // Rotor speed (rad/s) ramps from slow to fast; integrate to get the angle.
  const rate = (f: number) => interpolate(f, [whirlAt - 5, whirlAt + 40], [0.7, 14], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let angle = 0;
  for (let f = 0; f < frame; f++) angle += rate(f) / fps;
  const fast = ramp(frame, whirlAt + 10, whirlAt + 40);
  const down = ramp(frame, downAt - 10, downAt + 10);
  const lift = ramp(frame, upAt - 15, upAt + 5);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [6.5, 4.2, 8.5], fov: 45 }} lookAt={[-0.3, 0.6, 0]}>
        <CloudField speed={0.4} count={10} seed="ep7-wings" y={[-8, -2]} />
        <group position={[0, Math.sin(t * 1.4) * 0.05, 0]}>
          <Helicopter rotor={angle} tail={angle * 3} blur={fast} highlight={{ blades: frame >= wingsAt - 5 && fast < 0.5 }} />
        </group>
        {/* Air pushed down through the rotor disc */}
        {Array.from({ length: 46 }, (_, i) => {
          const u = (((random(`dw${i}`) + t * 0.9) % 1) + 1) % 1;
          const a = random(`dwa${i}`) * Math.PI * 2;
          const r = 1 + random(`dwr${i}`) * 3;
          return (
            <mesh key={i} position={[Math.cos(a) * r, ROTOR_Y - 0.2 - u * 6, Math.sin(a) * r]} scale={[1, 3, 1]}>
              <sphereGeometry args={[0.05, 8, 6]} />
              <meshStandardMaterial color="#e6f4ff" emissive="#9cc9ff" emissiveIntensity={0.8} transparent opacity={down * (1 - u)} />
            </mesh>
          );
        })}
        <Arrow origin={[0, ROTOR_Y + 0.2, 0]} dir={[0, 1, 0]} length={2.6} color={FORCE_COLORS.lift} progress={lift} label="LIFT ↑" labelOffset={[0, 0.5, 0]} thickness={0.12} labelHeight={0.6} />
        <Label3D position={[2.6, ROTOR_Y + 0.9, -2.2]} text="each blade = a long, thin wing" background="#b38600" opacity={ramp(frame, wingsAt, wingsAt + 10) * (1 - fast)} height={0.5} />
        <Label3D position={[2.6, -0.9, 1.6]} text="air pushed DOWN" background="#2f7cf6" opacity={down} height={0.5} />
      </Stage>
    </AbsoluteFill>
  );
};
