import { Line } from "@react-three/drei";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Hills, Patchwork, River } from "../map";

const FROM: [number, number] = [-17, 6];
const TO: [number, number] = [17, -5];
const WAYPOINTS: { name: string; at: [number, number] }[] = [
  { name: "SUNNY", at: [-9, -3] },
  { name: "RIVER", at: [-1, 2] },
  { name: "PEAKS", at: [7, -7] },
];
const ROUTE: [number, number][] = [FROM, ...WAYPOINTS.map((w) => w.at), TO];

const Airport: React.FC<{ at: [number, number]; name: string; show: number }> = ({ at, name, show }) => (
  <group position={[at[0], 0, at[1]]}>
    <mesh position={[0, 0.03, 0]} rotation={[0, 0.4, 0]}>
      <boxGeometry args={[4, 0.06, 0.7]} />
      <meshStandardMaterial color="#4a4f58" />
    </mesh>
    <Label3D position={[0, 1.8, 0]} text={name} background="#0d2340" height={1.5} opacity={show} />
  </group>
);

/** A map seen from above: airports, waypoints and the dotted route joining them. */
export const Plan: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const start = wordFrame(scene, "waypoints", 0, 150) - 20;
  const end = Math.max(start + 40, wordFrame(scene, "puzzle", 0, 260));
  // Route drawing progress over all legs (0 .. number of legs).
  const legs = ROUTE.length - 1;
  const drawn = interpolate(frame, [start, end], [0, legs], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const computer = ramp(frame, wordFrame(scene, "computer", 0, 60), wordFrame(scene, "computer", 0, 60) + 12);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [0, 30, 15], fov: 45 }} lookAt={[0, 0, 0]}>
        <Patchwork size={[56, 36]} cell={4} seed="ep4-plan" />
        <River from={-28} to={28} z0={1} seed={2} />
        <Hills spots={[[6, -12, 2.4], [10, -11, 3], [13, -13, 2]]} />
        <Airport at={FROM} name="FROM: Sunnyville" show={1} />
        <Airport at={TO} name="TO: Cloud City" show={1} />
        {ROUTE.slice(1).map((p, i) => {
          const a = ROUTE[i];
          const k = Math.min(1, Math.max(0, drawn - i));
          if (!a || k <= 0) return null;
          const b: [number, number] = [a[0] + (p[0] - a[0]) * k, a[1] + (p[1] - a[1]) * k];
          return <Line key={i} points={[[a[0], 0.4, a[1]], [b[0], 0.4, b[1]]]} color="#e040fb" lineWidth={6} dashed dashSize={0.8} gapSize={0.5} />;
        })}
        {WAYPOINTS.map((w, i) => {
          const show = ramp(drawn, i + 0.7, i + 1);
          return (
            <group key={w.name} position={[w.at[0], 0.4, w.at[1]]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} scale={show}>
                <torusGeometry args={[0.8, 0.16, 12, 32]} />
                <meshStandardMaterial color="#e040fb" emissive="#e040fb" emissiveIntensity={0.7} />
              </mesh>
              <Label3D position={[0, 1.5, 0]} text={w.name} background="#b0179b" height={1} opacity={show} />
            </group>
          );
        })}
        <group position={[FROM[0] + 2, 1.2, FROM[1] - 1.5]} rotation={[0, 0.4, 0]} scale={0.45}>
          <Airplane gear={1} />
        </group>
      </Stage>
      <InfoCard corner="tl" show={computer}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>FLIGHT PLAN</div>
        {["Sunnyville", ...WAYPOINTS.map((w) => w.name), "Cloud City"].map((name, i) => (
          <div key={name} style={{ fontSize: 38, fontWeight: 800, color: i === 0 || i === legs ? "#0d2340" : "#b0179b", opacity: i === 0 || drawn >= i - 0.3 ? 1 : 0.25 }}>
            {i + 1}. {name}
          </div>
        ))}
      </InfoCard>
    </AbsoluteFill>
  );
};
