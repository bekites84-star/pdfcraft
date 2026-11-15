import { Line } from "@react-three/drei";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Hills, Patchwork, River } from "../map";

/** A compass card whose needle wobbles toward north. */
const Compass: React.FC<{ t: number }> = ({ t }) => {
  const needle = Math.sin(t * 2.1) * 12 + Math.sin(t * 5.3) * 4;
  return (
    <div style={{ position: "relative", width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, #fffaf0 0%, #efe3c4 100%)", border: "10px solid #8a6a3a", boxShadow: "inset 0 0 12px rgba(0,0,0,0.25)" }}>
      {(["N", "E", "S", "W"] as const).map((d, i) => (
        <div
          key={d}
          style={{
            position: "absolute",
            left: 90 + Math.sin((i * Math.PI) / 2) * 70 - 12,
            top: 90 - Math.cos((i * Math.PI) / 2) * 70 - 18,
            width: 24,
            textAlign: "center",
            fontSize: 30,
            fontWeight: 900,
            color: d === "N" ? "#c0392b" : "#3b2f1e",
          }}
        >
          {d}
        </div>
      ))}
      <div style={{ position: "absolute", left: 85, top: 20, width: 10, height: 140, transform: `rotate(${needle}deg)`, transformOrigin: "50% 50%" }}>
        <div style={{ height: 70, background: "#c0392b", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
        <div style={{ height: 70, background: "#3b4a5a", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
      </div>
    </div>
  );
};

/** Before computers: follow the river and the railway, check the compass. */
export const OldWays: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = frame / scene.durationInFrames;
  const x = interpolate(k, [0, 1], [-14, 10]);
  const z = -6 + Math.sin(x * 0.35 + 1) * 2.2 + Math.sin(x * 0.13) * 1.5; // follow the river below
  const mapAt = wordFrame(scene, "maps", 0, 30);
  const compassAt = wordFrame(scene, "compass", 0, 60);
  const riverAt = wordFrame(scene, "rivers", 0, 120);
  const railAt = wordFrame(scene, "railway", 0, 170);
  const cloudyAt = wordFrame(scene, "cloudy", 0, 230);
  const clouds = ramp(frame, cloudyAt, cloudyAt + 25);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x - 10, 8, z + 13] }} lookAt={[x + 3, -3, z]}>
        <group position={[0, -6, 0]}>
          <Patchwork size={[90, 60]} cell={5} seed="ep4-old" />
          <River from={-45} to={45} z0={-6} />
          <Hills spots={[[-6, -24, 4], [18, -23, 5]]} />
          {/* Railway line: a dark track with sleepers */}
          <mesh position={[0, 0.03, -15]}>
            <boxGeometry args={[90, 0.03, 0.5]} />
            <meshStandardMaterial color="#5a4a3a" />
          </mesh>
          {Array.from({ length: 60 }, (_, i) => (
            <mesh key={i} position={[-45 + i * 1.5, 0.06, -15]}>
              <boxGeometry args={[0.2, 0.04, 1.1]} />
              <meshStandardMaterial color="#3b2f25" />
            </mesh>
          ))}
          <Label3D position={[x + 8, 1.5, -6 + Math.sin((x + 8) * 0.35 + 1) * 2.2]} text="follow the river" background="#2f7cf6" opacity={ramp(frame, riverAt, riverAt + 10)} height={1.3} />
          <Label3D position={[x + 9, 1.5, -15]} text="railway line" background="#5a4a3a" opacity={ramp(frame, railAt, railAt + 10)} height={1.3} />
          <Line
            points={Array.from({ length: 30 }, (_, i) => {
              const xx = x - 15 + i * 0.5;
              return [xx, 0.2, -6 + Math.sin(xx * 0.35 + 1) * 2.2 + Math.sin(xx * 0.13) * 1.5] as [number, number, number];
            })}
            color="#ffffff"
            lineWidth={3}
            dashed
            dashSize={0.5}
            gapSize={0.4}
            transparent
            opacity={0.8}
          />
        </group>
        {Array.from({ length: 10 }, (_, i) => (
          <Cloud key={i} seed={140 + i} position={[x - 6 + i * 3, -1.2 + (i % 2) * 0.8, z + 2 - (i % 3) * 3]} scale={1.4 * clouds} opacity={0.95} />
        ))}
        <group position={[x, 0, z]} rotation={[0, -0.05, 0]} scale={0.8}>
          <Airplane fan={t * 25} />
        </group>
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, mapAt, mapAt + 12)} style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>THE OLD WAY</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#0d2340" }}>🗺️ paper map</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: "#0d2340", opacity: ramp(frame, compassAt, compassAt + 10) }}>🧭 compass</div>
        </div>
        <div style={{ opacity: ramp(frame, compassAt, compassAt + 10) }}>
          <Compass t={t} />
        </div>
      </InfoCard>
    </AbsoluteFill>
  );
};
