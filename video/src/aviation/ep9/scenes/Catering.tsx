import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, PARKED_Y, Truck } from "../airport";

const DOOR_X = -2.2;

/** The catering truck's box scissors up to the rear door. */
export const Catering: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const liftAt = wordFrame(scene, "lifts", 0, 40);
  const cleanAt = wordFrame(scene, "cleaners", 0, 180);
  const lift = interpolate(frame, [liftAt, liftAt + 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const boxY = 0.55 + lift * 0.42;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [1.5, 1.6, 7.5], fov: 45 }} lookAt={[-2.2, 0.8, 1.2]}>
        <Apron />
        <group position={[0, PARKED_Y, 0]}>
          <Airplane gear={1} cabinGlow={0.4} />
        </group>
        <Truck position={[DOOR_X, 0, 2.7]} heading={Math.PI / 2} color="#2f7cf6" length={2.4}>
          {/* Scissor lift arms */}
          {[-0.3, 0.3].map((z) => (
            <group key={z}>
              <mesh position={[0, 0.38 + (boxY - 0.38) / 2, z]} rotation={[0, 0, 0.9 - lift * 0.5]}>
                <boxGeometry args={[1.2, 0.05, 0.05]} />
                <meshStandardMaterial color="#9aa3b1" />
              </mesh>
              <mesh position={[0, 0.38 + (boxY - 0.38) / 2, z]} rotation={[0, 0, -0.9 + lift * 0.5]}>
                <boxGeometry args={[1.2, 0.05, 0.05]} />
                <meshStandardMaterial color="#9aa3b1" />
              </mesh>
            </group>
          ))}
          <mesh position={[-0.15, boxY + 0.35, 0]}>
            <boxGeometry args={[1.7, 0.7, 0.85]} />
            <meshStandardMaterial color="#f4f6fa" />
          </mesh>
          <mesh position={[0.71, boxY + 0.35, 0]}>
            <boxGeometry args={[0.02, 0.5, 0.6]} />
            <meshStandardMaterial color="#2f7cf6" />
          </mesh>
        </Truck>
        <Label3D position={[DOOR_X, boxY + 1.25, 2.3]} text="meals & drinks" background="#2f7cf6" opacity={ramp(frame, liftAt + 30, liftAt + 40)} height={0.35} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, cleanAt - 5, cleanAt + 8)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>INSIDE THE CABIN</div>
        <div style={{ fontSize: 44, fontWeight: 900, color: "#0d2340" }}>🧹 cleaners tidy up</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
