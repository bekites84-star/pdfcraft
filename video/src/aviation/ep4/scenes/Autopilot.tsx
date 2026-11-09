import { Line } from "@react-three/drei";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { followCurve, smoothPath } from "../../lib/path";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const ROUTE = smoothPath([
  [0, 0, 0],
  [26, 0, 0],
  [40, 0, -6],
  [52, 0, -20],
  [62, 0, -36],
  [80, 0, -42],
]);
const WAYPOINTS: { name: string; u: number }[] = [
  { name: "RIVER", u: 0.36 },
  { name: "PEAKS", u: 0.74 },
];

/** Chase view: the autopilot flies the magenta line, banking through each waypoint. */
export const Autopilot: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const u = (frame / scene.durationInFrames) * 0.92;
  const pose = followCurve(ROUTE, u);
  const [px, py, pz] = pose.position;
  const tan = pose.tangent;
  const cam: [number, number, number] = [px - tan.x * 13 + tan.z * 3, py + 4.2, pz - tan.z * 13 - tan.x * 3];
  const look: [number, number, number] = [px + tan.x * 9, py - 0.8, pz + tan.z * 9];
  const autopilot = ramp(frame, wordFrame(scene, "autopilot", 0, 20), wordFrame(scene, "autopilot", 0, 20) + 10);
  const atcAt = wordFrame(scene, "traffic", 0, 220) - 10;
  const atc = ramp(frame, atcAt, atcAt + 10);
  const routePts = ROUTE.getSpacedPoints(120).map((p) => [p.x, p.y - 0.05, p.z] as [number, number, number]);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: cam, fov: 45 }} lookAt={look}>
        <Line points={routePts} color="#e040fb" lineWidth={5} transparent opacity={0.85} />
        {WAYPOINTS.map((w) => {
          const p = ROUTE.getPointAt(w.u);
          const tw = ROUTE.getTangentAt(w.u);
          return (
            <group key={w.name} position={p} rotation={[0, Math.atan2(-tw.z, tw.x), 0]}>
              <mesh rotation={[0, Math.PI / 2, 0]}>
                <torusGeometry args={[3.2, 0.12, 12, 48]} />
                <meshStandardMaterial color="#e040fb" emissive="#e040fb" emissiveIntensity={0.8} transparent opacity={0.85} />
              </mesh>
              <Label3D position={[0, 4.2, 0]} text={w.name} background="#b0179b" height={1.2} />
            </group>
          );
        })}
        {Array.from({ length: 24 }, (_, i) => {
          const p = ROUTE.getPointAt(random(`ac-${i}`));
          const side = random(`acs-${i}`) > 0.5 ? 1 : -1;
          return <Cloud key={i} seed={80 + i} position={[p.x + (random(`acx${i}`) - 0.5) * 10, p.y - 4 - random(`acy${i}`) * 4, p.z + side * (9 + random(`acz${i}`) * 12)]} scale={1.6} />;
        })}
        <group position={pose.position} rotation={[0, pose.yaw, 0]}>
          <group rotation={[pose.bank, 0, 0]}>
            <Airplane fan={t * 30} aileron={-pose.bank * 0.4} />
          </group>
        </group>
      </Stage>
      <InfoCard corner="tr" show={autopilot}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>AUTOPILOT</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: "#22b35e" }}>ON ✓</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#b0179b" }}>following the magenta line</div>
      </InfoCard>
      <InfoCard corner="tl" show={atc} style={{ maxWidth: 640 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>🎧 AIR TRAFFIC CONTROL</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#0d2340" }}>“Climb to 36,000 feet, then fly direct to PEAKS.”</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
