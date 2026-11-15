import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, BAG_COLORS, Cart, PARKED_Y, Person, Suitcase, Tug, useT } from "../airport";

const DOOR: [number, number, number] = [-1.3, PARKED_Y - 0.28, 0.46];
const BELT_FOOT: [number, number, number] = [-1.3, 0.25, 3.1];

/** A cart train pulls up; bags ride the belt loader up into the cargo hold. */
export const Loading: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const cartAt = wordFrame(scene, "carts", 0, 70);
  const beltAt = wordFrame(scene, "loader", 0, 120);
  const holdAt = wordFrame(scene, "hold", 0, 170);
  const trainX = interpolate(frame, [0, cartAt + 20], [-12, -3.6], { extrapolateRight: "clamp" });
  const dx = DOOR[0] - BELT_FOOT[0];
  const dy = DOOR[1] - BELT_FOOT[1];
  const dz = DOOR[2] - BELT_FOOT[2];
  const len = Math.hypot(dy, dz);
  const pitch = Math.atan2(dy, -dz);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [3.4, 1.8, 6.4], fov: 45 }} lookAt={[-1.6, 0.6, 2.0]}>
        <Apron />
        <group position={[0, PARKED_Y, 0]}>
          <Airplane gear={1} />
        </group>
        {/* Open cargo door: a dark opening low on the right side */}
        <mesh position={[DOOR[0], DOOR[1], DOOR[2] - 0.02]}>
          <boxGeometry args={[0.45, 0.3, 0.02]} />
          <meshStandardMaterial color="#141820" />
        </mesh>
        {/* Belt loader */}
        <group position={[(DOOR[0] + BELT_FOOT[0]) / 2 + dx / 2, (DOOR[1] + BELT_FOOT[1]) / 2, (DOOR[2] + BELT_FOOT[2]) / 2]} rotation={[pitch, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.5, 0.08, len]} />
            <meshStandardMaterial color="#2a2f38" />
          </mesh>
          <mesh position={[0.28, 0.08, 0]}>
            <boxGeometry args={[0.04, 0.12, len]} />
            <meshStandardMaterial color="#2a2f38" />
          </mesh>
        </group>
        <mesh position={[BELT_FOOT[0], 0.18, BELT_FOOT[2] - 0.6]}>
          <boxGeometry args={[0.8, 0.25, 2.2]} />
          <meshStandardMaterial color="#ffd23f" />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => {
          const u = (((t * 0.35 + i / 6) % 1) + 1) % 1;
          const k = ramp(frame, beltAt - 5, beltAt + 5);
          if (k <= 0) return null;
          return <Suitcase key={i} position={[BELT_FOOT[0], BELT_FOOT[1] + dy * u + 0.13, BELT_FOOT[2] + dz * u]} rotation={Math.PI / 2} color={BAG_COLORS[i % BAG_COLORS.length] ?? "#e5484d"} />;
        })}
        {/* Cart train with a tug in front */}
        <group position={[trainX, 0, 4.6]}>
          <Tug position={[1.3, 0, 0]} />
          {[0, 1, 2].map((i) => (
            <Cart key={i} position={[-i * 1.05, 0, 0]} seed={i * 2 + 1} />
          ))}
        </group>
        <Person position={[-0.6, 0, 3.4]} heading={2} walk={t} />
        <Label3D position={[-0.4, 1.3, 2.6]} text="belt loader" background="#b38600" opacity={ramp(frame, beltAt, beltAt + 10)} height={0.42} />
        <Label3D position={[-1.9, 1.25, 0.9]} text="into the hold" background="#0d2340" opacity={ramp(frame, holdAt, holdAt + 10)} height={0.4} />
      </Stage>
    </AbsoluteFill>
  );
};
