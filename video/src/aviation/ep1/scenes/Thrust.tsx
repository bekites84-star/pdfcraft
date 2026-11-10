import { interpolate, Easing, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Arrow, CloudField, FORCE_COLORS, Label3D, Stage, useGrow } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const ENGINE_Y = -0.64;
const ENGINE_X = 0.75;

const AirStreams: React.FC<{ z: number; t: number }> = ({ z, t }) => (
  <>
    {Array.from({ length: 14 }, (_, i) => {
      // Intake: slow, converging into the engine front.
      const u = ((random(`in-${z}-${i}`) + t * 0.9) % 1 + 1) % 1;
      const a = random(`ia-${z}-${i}`) * Math.PI * 2;
      const r = interpolate(u, [0, 1], [0.75, 0.15]);
      const x = interpolate(u, [0, 1], [4.2, ENGINE_X + 0.55]);
      return (
        <mesh key={`i${i}`} position={[x, ENGINE_Y + Math.sin(a) * r, z + Math.cos(a) * r]} scale={[1.8, 1, 1]}>
          <sphereGeometry args={[0.045, 8, 6]} />
          <meshStandardMaterial color="#d9ecff" emissive="#9cc9ff" emissiveIntensity={0.7} />
        </mesh>
      );
    })}
    {Array.from({ length: 22 }, (_, i) => {
      // Exhaust: fast, streaming out the back.
      const u = ((random(`out-${z}-${i}`) + t * 1.6) % 1 + 1) % 1;
      const a = random(`oa-${z}-${i}`) * Math.PI * 2;
      const r = interpolate(u, [0, 1], [0.12, 0.45]);
      const x = interpolate(u, [0, 1], [ENGINE_X - 0.5, -11]);
      return (
        <mesh key={`o${i}`} position={[x, ENGINE_Y + Math.sin(a) * r, z + Math.cos(a) * r]} scale={[6, 1, 1]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshStandardMaterial color="#ffffff" emissive="#bfe0ff" emissiveIntensity={0.9} transparent opacity={1 - u * 0.7} />
        </mesh>
      );
    })}
  </>
);

export const Thrust: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pullAt = wordFrame(scene, "pushing", 0, 180) - 25;
  const k = interpolate(frame, [pullAt, pullAt + 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const cam: [number, number, number] = [interpolate(k, [0, 1], [4.6, 2]), interpolate(k, [0, 1], [-0.1, 2.5]), interpolate(k, [0, 1], [5.2, 15])];
  const look: [number, number, number] = [interpolate(k, [0, 1], [0.6, 0]), interpolate(k, [0, 1], [-0.6, 0]), interpolate(k, [0, 1], [1.6, 0])];
  const airIn = useGrow(wordFrame(scene, "suck", 0, 60));
  const airOut = useGrow(wordFrame(scene, "blast", 0, 100));
  const thrust = useGrow(wordFrame(scene, "forward", 0, 260));
  const labelsFade = 1 - k;

  return (
    <Stage camera={{ position: cam, fov: 42 }} lookAt={look}>
      <CloudField speed={1 + 5 * k} count={12} seed="thrust" />
      <group rotation={[0, -0.25 * k, 0]}>
        <Airplane fan={t * 35} />
        <AirStreams z={1.6} t={t} />
        <AirStreams z={-1.6} t={t} />
        <Label3D position={[ENGINE_X + 2.2, ENGINE_Y + 0.75, 1.6]} text="air IN" background="#2f7cf6" opacity={airIn * labelsFade} height={0.32} />
        <Label3D position={[ENGINE_X - 2.3, ENGINE_Y - 0.75, 1.6]} text="air OUT, very fast!" background="#0d2340" opacity={airOut * labelsFade} height={0.32} />
        <Arrow origin={[3.4, 0, 0]} dir={[1, 0, 0]} length={2.8} color={FORCE_COLORS.thrust} progress={thrust} label="THRUST →" labelOffset={[0.2, 0.75, 0]} />
      </group>
    </Stage>
  );
};
