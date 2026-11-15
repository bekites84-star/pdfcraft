import { Line } from "@react-three/drei";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { wingY } from "../../lib/airplaneGeometry";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Apron, PARKED_Y, Person, Truck, useT } from "../airport";

/** A fuel truck under the wing, its hose up to the refuelling point; the gauge fills. */
export const Fuel: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const t = useT();
  const pumpAt = wordFrame(scene, "pumps", 0, 30);
  const tubAt = wordFrame(scene, "bathtubs", 0, 200);
  const fill = ramp(frame, pumpAt, scene.durationInFrames - 10);
  const point: [number, number, number] = [-0.2, PARKED_Y + wingY(2.4) - 0.08, 2.4];
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [4.6, 2.4, 9.6], fov: 42 }} lookAt={[-0.5, 0.6, 2.4]}>
        <Apron />
        <group position={[0, PARKED_Y, 0]}>
          <Airplane gear={1} />
        </group>
        <Truck position={[-0.6, 0, 4.2]} color="#e5484d" length={2.6}>
          <mesh position={[-0.35, 0.78, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 1.5, 24]} />
            <meshStandardMaterial color="#e9edf3" metalness={0.3} roughness={0.3} />
          </mesh>
        </Truck>
        <Line points={[[-0.6, 0.9, 3.8], [-0.4, 0.45, 3.2], point]} color="#20242b" lineWidth={5} />
        <Person position={[0.2, 0, 3.1]} heading={2.6} walk={0} />
        {Array.from({ length: 5 }, (_, i) => {
          const u = (((t * 1.2 + i / 5) % 1) + 1) % 1;
          return (
            <mesh key={i} position={[-0.6 + (point[0] + 0.6) * u, 0.9 + (point[1] - 0.9) * u, 3.8 + (point[2] - 3.8) * u]}>
              <sphereGeometry args={[0.035, 8, 6]} />
              <meshBasicMaterial color="#ffd23f" transparent opacity={ramp(frame, pumpAt, pumpAt + 10)} />
            </mesh>
          );
        })}
        <Label3D position={[0.6, PARKED_Y + 0.55, 2.2]} text="fuel tanks are in the wings" background="#f08a24" opacity={ramp(frame, pumpAt + 20, pumpAt + 30)} height={0.32} />
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>FUEL</div>
        <div style={{ width: 420, height: 40, borderRadius: 20, background: "rgba(13,35,64,0.15)", overflow: "hidden", marginTop: 8 }}>
          <div style={{ width: `${8 + fill * 92}%`, height: "100%", background: "#f08a24", borderRadius: 20 }} />
        </div>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#0d2340", marginTop: 12, opacity: ramp(frame, tubAt - 10, tubAt + 5) }}>= 1,000 bathtubs 🛁</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
