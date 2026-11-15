import { Line } from "@react-three/drei";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { bump } from "../shake";

const AMP = 0.35;

/** Side view: the plane bobs gently; its trail shows small ups and downs along a straight course. */
export const Feel: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const carAt = wordFrame(scene, "car", 0, 60);
  const boatAt = wordFrame(scene, "boat", 0, 100);
  const courseAt = wordFrame(scene, "course", 0, 250);
  const course = ramp(frame, courseAt - 15, courseAt + 5);
  // The world streams past at 3 units/s; the trail samples where the plane was.
  const trail = Array.from({ length: 60 }, (_, i) => {
    const back = i * 0.12;
    return [-back * 3 - 3.2, bump(t - back) * AMP, 0] as [number, number, number];
  });
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-2, 1.2, 15] }} lookAt={[-2, 0.2, 0]}>
        <CloudField speed={3} count={14} seed="ep5-feel" />
        <Line points={trail} color="#ffffff" lineWidth={4} dashed dashSize={0.3} gapSize={0.2} transparent opacity={0.85} />
        <Line points={[[-22, 0, 0.01], [8, 0, 0.01]]} color="#22b35e" lineWidth={3} transparent opacity={0.9 * course} />
        <group position={[0, bump(t) * AMP, 0]} rotation={[0, -0.05, bump(t, 3) * 0.03]} scale={0.8}>
          <Airplane fan={t * 30} wingFlex={bump(t, 5) * 0.02} />
        </group>
        <Label3D position={[-7, 1.9, 0]} text="little ups and downs" background="#2f7cf6" opacity={ramp(frame, carAt, carAt + 12)} height={0.75} />
        <Label3D position={[3, -1.7, 0]} text="still on course ✓" background="#22b35e" opacity={course} height={0.75} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, carAt - 5, carAt + 8)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>FEELS LIKE…</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#0d2340" }}>🚗 a bumpy road</div>
        <div style={{ fontSize: 44, fontWeight: 800, color: "#0d2340", opacity: ramp(frame, boatAt, boatAt + 10) }}>⛵ little waves</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
