import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Arrow, FORCE_COLORS, Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { AirDots } from "../air";

const Fuel: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ marginTop: 14 }}>
    <div style={{ fontSize: 30, fontWeight: 800, color }}>{label}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: 380, height: 34, borderRadius: 17, background: "rgba(13,35,64,0.15)", overflow: "hidden" }}>
        <div style={{ width: `${value * 100}%`, height: "100%", background: color, borderRadius: 17 }} />
      </div>
      <div style={{ fontSize: 34, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums", width: 90 }}>{Math.round(value * 100)}%</div>
    </div>
  </div>
);

/** High plane vs low plane: same trip, different drag, different fuel use. */
export const FuelScene: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const burnAt = wordFrame(scene, "burns", 0, 60);
  const burn = ramp(frame, burnAt - 30, scene.durationInFrames - 15);
  const farther = ramp(frame, wordFrame(scene, "farther", 0, 200), wordFrame(scene, "farther", 0, 200) + 12);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #123a7a 0%, #2f74c8 50%, #8cc4f5 100%)" camera={{ position: [0, 0, 22] }} lookAt={[2.5, 0, 0]}>
        {/* Thin air above, thick air below (the line between them at y = 0) */}
        <AirDots toY={(km) => -8 + (km / 12) * 16} kmRange={[0, 12]} xRange={[-14, 20]} seed="fuel" />
        <group position={[-1, 3.4, 0]} scale={0.8}>
          <Airplane fan={t * 30} />
          <Arrow origin={[-3.8, 0.4, 0]} dir={[-1, 0, 0]} length={1.3} color={FORCE_COLORS.drag} progress={1} label="small drag" labelOffset={[-2, 0, 0]} thickness={0.16} labelHeight={1.15} />
        </group>
        <Label3D position={[-1, 5.6, 0]} text="HIGH: 11 km" background="#2f7cf6" height={0.95} />
        <group position={[-1, -4.2, 0]} scale={0.8}>
          <Airplane fan={t * 30} />
          <Arrow origin={[-3.8, 0.4, 0]} dir={[-1, 0, 0]} length={4} color={FORCE_COLORS.drag} progress={1} label="BIG drag" labelOffset={[-1.7, 0, 0]} thickness={0.2} labelHeight={1.15} />
        </group>
        <Label3D position={[-1, -2.0, 0]} text="LOW: 2 km" background="#e5484d" height={0.95} />
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>FUEL LEFT</div>
        <Fuel label="HIGH plane" value={1 - 0.25 * burn} color="#2f7cf6" />
        <Fuel label="LOW plane" value={1 - 0.62 * burn} color="#e5484d" />
        <div style={{ marginTop: 16, fontSize: 34, fontWeight: 800, color: "#22b35e", opacity: farther }}>High = flies much farther ✈️</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
