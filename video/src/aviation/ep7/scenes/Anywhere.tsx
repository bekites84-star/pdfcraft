import { Line } from "@react-three/drei";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Label3D, Stage } from "../../lib/common";
import { Helicopter, SKID_HEIGHT } from "../../lib/Helicopter";
import { InfoCard, Mountain, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Helipad, spin } from "../world";

/** Three places only a helicopter can land: a rooftop, a ship and a mountain. */
export const Anywhere: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const roofAt = wordFrame(scene, "rooftops", 0, 60);
  const shipAt = wordFrame(scene, "ships", 0, 100);
  const mtnAt = wordFrame(scene, "mountains", 0, 150);
  const rescueAt = wordFrame(scene, "rescues", 0, 200);
  const camX = interpolate(frame, [0, roofAt, shipAt, mtnAt + 10], [-16, -15, 0, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bob = (s: number) => Math.sin(t * 1.5 + s) * 0.07;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [camX, 7, 20], fov: 45 }} lookAt={[camX, 4, 0]}>
        {/* City ground, sea, mountain foot */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-20, 0, 0]}>
          <planeGeometry args={[26, 60]} />
          <meshStandardMaterial color="#8f969f" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[16, 60]} />
          <meshStandardMaterial color="#2f74c8" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[20, 0, 0]}>
          <planeGeometry args={[26, 60]} />
          <meshStandardMaterial color="#6d9b55" />
        </mesh>
        {/* Rooftop hospital pad */}
        <mesh position={[-15, 3, -1]}>
          <boxGeometry args={[7, 6, 7]} />
          <meshStandardMaterial color="#e9edf3" />
        </mesh>
        {[-17, -15, -13].map((x) => [1.2, 3.2].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, 2.52]}>
            <boxGeometry args={[1.2, 0.9, 0.02]} />
            <meshStandardMaterial color="#5f86b8" />
          </mesh>
        )))}
        <Helipad position={[-15, 6.01, -1]} radius={2.8} />
        <group position={[-15, 6 + SKID_HEIGHT, -1]} rotation={[0, 0.6, 0]} scale={0.8}>
          <Helicopter rotor={spin(t, 6)} tail={spin(t, 20)} blur={0.6} />
        </group>
        {/* Ship with a deck pad */}
        <mesh position={[0, 0.6, -1]}>
          <boxGeometry args={[11, 1.6, 3.6]} />
          <meshStandardMaterial color="#f1f3f6" />
        </mesh>
        <mesh position={[0, -0.05, -1]}>
          <boxGeometry args={[11.2, 0.5, 3.7]} />
          <meshStandardMaterial color="#c0392b" />
        </mesh>
        <mesh position={[3, 2.4, -1]}>
          <boxGeometry args={[3, 2, 3]} />
          <meshStandardMaterial color="#dfe4ea" />
        </mesh>
        <Helipad position={[-2.6, 1.41, -1]} radius={1.6} />
        <group position={[-2.6, 1.4 + SKID_HEIGHT * 0.65 + 2.2 + bob(1), -1]} rotation={[0, -0.4, 0]} scale={0.65}>
          <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} />
        </group>
        {/* Mountain rescue with a winch line */}
        <Mountain position={[16, 0, -4]} height={9} radius={6} seed={4} />
        <group position={[14.5, 8.5 + bob(2), 0]} rotation={[0, 0.3, 0]} scale={0.8}>
          <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} />
        </group>
        <Line points={[[14.5, 7.6, 0.7], [14.5, 3.2 + Math.sin(t) * 0.3, 0.7]]} color="#2a2f38" lineWidth={2} />
        <mesh position={[14.5, 3 + Math.sin(t) * 0.3, 0.7]}>
          <sphereGeometry args={[0.25, 12, 10]} />
          <meshStandardMaterial color="#f08a24" />
        </mesh>
        <Label3D position={[-15, 9.8, -1]} text="rooftops" background="#0d2340" opacity={ramp(frame, roofAt - 5, roofAt + 8)} height={1} />
        <Label3D position={[-1, 7.5, -1]} text="ships" background="#0d2340" opacity={ramp(frame, shipAt - 5, shipAt + 8)} height={1} />
        <Label3D position={[13, 10.6, -1]} text="mountains" background="#0d2340" opacity={ramp(frame, mtnAt - 5, mtnAt + 8)} height={1} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, rescueAt - 5, rescueAt + 8)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>HELICOPTERS HELP WITH</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#0d2340" }}>🛟 rescues · 🏥 hospitals · 🔥 firefighting</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
