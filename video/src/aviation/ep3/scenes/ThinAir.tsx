import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Arrow, FORCE_COLORS, Label3D, Stage } from "../../lib/common";
import { InfoCard } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { AirDots, airDensity } from "../air";

const toY = (km: number) => -7.2 + (km / 12) * 13.6;

/** An altitude ruler with air "dots" thinning out as the plane climbs; drag shrinks with them. */
export const ThinAir: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const climbFrom = wordFrame(scene, "higher", 0, 30);
  const climbTo = Math.max(climbFrom + 30, wordFrame(scene, "height", 0, 150));
  const km = interpolate(frame, [climbFrom, climbTo], [1, 11], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const rho = airDensity(km);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #123a7a 0%, #2f74c8 55%, #8cc4f5 100%)" camera={{ position: [0, 0, 24] }} lookAt={[0, 0, 0]}>
        <AirDots toY={toY} kmRange={[0, 12]} xRange={[-16, 16]} />
        {/* Ruler */}
        <mesh position={[-11.5, toY(6), 0]}>
          <boxGeometry args={[0.08, toY(12) - toY(0), 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {[0, 3, 6, 9, 12].map((h) => (
          <group key={h}>
            <mesh position={[-11.5, toY(h), 0]}>
              <boxGeometry args={[0.6, 0.08, 0.08]} />
              <meshStandardMaterial color="#ffffff" />
            </mesh>
            <Label3D position={[-10, toY(h), 0]} text={`${h} km`} background="rgba(13,35,64,0.75)" height={0.85} />
          </group>
        ))}
        <group position={[2, toY(km), 0]} scale={0.85}>
          <Airplane fan={(frame / fps) * 30} />
          <Arrow origin={[-3.8, 0.4, 0]} dir={[-1, 0, 0]} length={0.5 + 3.5 * rho} color={FORCE_COLORS.drag} progress={1} label="DRAG" labelOffset={[-1.1, 0, 0]} thickness={0.16} labelHeight={0.9} />
        </group>
      </Stage>
      <InfoCard corner="tr">
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>HEIGHT</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: "#0d2340", fontVariantNumeric: "tabular-nums" }}>{km.toFixed(1)} km</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a", marginTop: 10 }}>AIR (vs. the ground)</div>
        <div style={{ fontSize: 60, fontWeight: 900, color: "#2f7cf6", fontVariantNumeric: "tabular-nums" }}>{Math.round(rho * 100)} %</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
