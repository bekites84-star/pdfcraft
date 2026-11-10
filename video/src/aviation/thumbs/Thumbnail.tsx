import { Line } from "@react-three/drei";
import { AbsoluteFill } from "remotion";
import { Cockpit } from "../ep6/cockpit";
import { Helipad } from "../ep7/world";
import { Airplane, GEAR_HEIGHT } from "../lib/Airplane";
import { Arrow, Cloud, CloudField, FORCE_COLORS, Stage } from "../lib/common";
import { Helicopter, ROTOR_Y, SKID_HEIGHT } from "../lib/Helicopter";
import { Ground, Mountain, SmokePuff } from "../lib/props";

/** One YouTube thumbnail per episode: big words on the left, a bold 3D scene on the right. */

type Thumb = {
  episode: number;
  /** Lines of the headline; words wrapped in *stars* are drawn in yellow. */
  lines: string[];
  background: string;
  scene: React.ReactNode;
};

const SKYB = "linear-gradient(160deg, #1f6fe0 0%, #4fa3f5 55%, #bfe3ff 100%)";

const THUMBS: Thumb[] = [
  {
    episode: 1,
    lines: ["HOW DO", "PLANES", "*FLY?*"],
    background: SKYB,
    scene: (
      <Stage background={SKYB} camera={{ position: [-3.2, 1.5, 12], fov: 40 }} lookAt={[-3.6, 0.4, 0]}>
        <CloudField speed={0} count={12} seed="th1" y={[-6, -1]} z={[-20, -4]} />
        <group position={[0.6, -1.3, 0]} rotation={[0.25, -0.65, 0.12]} scale={1.05}>
          <Airplane />
          <Arrow origin={[0, 0.6, 0]} dir={[0, 1, 0]} length={2.6} color={FORCE_COLORS.lift} progress={1} label="LIFT" labelOffset={[0, 0.7, 0]} thickness={0.2} labelHeight={0.9} />
        </group>
      </Stage>
    ),
  },
  {
    episode: 2,
    lines: ["HOW DO", "PLANES", "*LAND?*"],
    background: "linear-gradient(180deg, #ff9a5a 0%, #ffcf8a 55%, #ffe8c2 100%)",
    scene: (
      <Stage background="linear-gradient(180deg, #ff9a5a 0%, #ffcf8a 55%, #ffe8c2 100%)" camera={{ position: [-9.5, 1.6, 9.5], fov: 40 }} lookAt={[-6.4, 1.2, -1.8]}>
        <Ground />
        <group position={[-3.5, GEAR_HEIGHT + 0.15, 0]} rotation={[0, -0.25, 0.11]} scale={1.05}>
          <Airplane gear={1} flaps={1} />
        </group>
        <SmokePuff at={-12} position={[-4.2, 0, 0.7]} drift={1.5} />
      </Stage>
    ),
  },
  {
    episode: 3,
    lines: ["WHY SO", "*HIGH?*"],
    background: "linear-gradient(180deg, #113f8c 0%, #3d86d8 60%, #a9d4ff 100%)",
    scene: (
      <Stage background="linear-gradient(180deg, #113f8c 0%, #3d86d8 60%, #a9d4ff 100%)" camera={{ position: [-3, 0, 20], fov: 40 }} lookAt={[-4, -1.5, 0]}>
        <Mountain position={[3.5, -12, -6]} height={9.5} radius={6.5} seed={1} />
        <Mountain position={[-6, -12, -10]} height={6.5} radius={5} seed={2} />
        <Mountain position={[11, -12, -12]} height={7} radius={5.5} seed={3} />
        {[-12, -5, 2, 8].map((x, i) => (
          <Cloud key={i} seed={300 + i} position={[x, -9 + (i % 2) * 0.6, -2]} scale={1.7} />
        ))}
        <group position={[3.2, 1.2, 0]} rotation={[0.05, -0.45, 0.06]} scale={1.1}>
          <Airplane />
        </group>
      </Stage>
    ),
  },
  {
    episode: 4,
    lines: ["NO ROADS", "IN THE", "*SKY?*"],
    background: SKYB,
    scene: (
      <Stage background={SKYB} camera={{ position: [-11, 3.4, 5.5], fov: 42 }} lookAt={[-3.4, -0.4, -3.3]}>
        <CloudField speed={0} count={10} seed="th4" y={[-7, -3]} z={[-25, 10]} />
        <Line points={[[-30, 0, 0], [0, 0, 0], [14, 0, -10], [40, 0, -14]]} color="#e040fb" lineWidth={8} />
        <mesh position={[3.5, 0, -2.2]} rotation={[0, Math.PI / 2 - 0.6, 0]}>
          <torusGeometry args={[3, 0.16, 12, 48]} />
          <meshStandardMaterial color="#e040fb" emissive="#e040fb" emissiveIntensity={0.9} />
        </mesh>
        <group position={[-2, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[-0.25, 0, 0]}>
            <Airplane />
          </group>
        </group>
      </Stage>
    ),
  },
  {
    episode: 5,
    lines: ["WHAT IS", "*TURBULENCE?*"],
    background: "linear-gradient(180deg, #2a3242 0%, #4b5870 55%, #7a879c 100%)",
    scene: (
      <Stage background="linear-gradient(180deg, #2a3242 0%, #4b5870 55%, #7a879c 100%)" camera={{ position: [-3, 0.5, 14], fov: 42 }} lookAt={[-4, 0, 0]}>
        <CloudField speed={0} count={18} seed="th5" y={[-7, 4]} z={[-24, -3]} color="#5d6676" glow={0.05} size={1.3} />
        <Line points={[[3.5, 6, -6], [2.7, 4.5, -6], [3.7, 3.4, -6], [2.9, 1.8, -6], [3.6, 0.6, -6]]} color="#fff7b0" lineWidth={7} />
        <pointLight position={[3.5, 3, -4]} intensity={160} distance={22} color="#e8ecff" />
        <group position={[0.4, -1.0, 0]} rotation={[0.2, -0.55, -0.22]} scale={1.05}>
          <Airplane wingFlex={0.06} />
        </group>
      </Stage>
    ),
  },
  {
    episode: 6,
    lines: ["INSIDE THE", "*COCKPIT*"],
    background: SKYB,
    scene: (
      <Stage background={SKYB} camera={{ position: [-2.3, 1.95, -0.35], fov: 52 }} lookAt={[0.8, 1.05, 0.55]}>
        <Cockpit pilots autopilot={1} throttle={0.8} />
      </Stage>
    ),
  },
  {
    episode: 7,
    lines: ["HOW DO", "HELICOPTERS", "*FLY?*"],
    background: SKYB,
    scene: (
      <Stage background={SKYB} camera={{ position: [3.5, 3.6, 13], fov: 42 }} lookAt={[-9.6, 3.4, 2.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[160, 160]} />
          <meshStandardMaterial color="#79b65d" roughness={1} />
        </mesh>
        <Helipad position={[-4.5, 0, 0]} radius={3.2} />
        <group position={[-4.5, SKID_HEIGHT + 2.4, 0]} rotation={[0, 0.55, 0.05]} scale={1.15}>
          <Helicopter rotor={0.4} tail={0.3} blur={0.9} tilt={[0.06, 0]} />
          <Arrow origin={[0, ROTOR_Y + 0.3, 0]} dir={[0, 1, 0]} length={2.2} color={FORCE_COLORS.lift} progress={1} thickness={0.16} />
        </group>
      </Stage>
    ),
  },
];

const Headline: React.FC<{ lines: string[] }> = ({ lines }) => {
  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, "").length));
  const size = Math.min(150, Math.floor(1150 / Math.max(6, longest)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1.0,
            letterSpacing: -1,
            color: line.includes("*") ? "#ffd23f" : "#ffffff",
            WebkitTextStroke: "6px #0b1a33",
            paintOrder: "stroke fill",
            textShadow: "0 8px 0 #0b1a33, 0 14px 30px rgba(0,0,0,0.45)",
            whiteSpace: "nowrap",
          }}
        >
          {line.replace(/\*/g, "")}
        </div>
      ))}
    </div>
  );
};

export const thumbnailEpisodes = THUMBS.map((t) => t.episode);

/** A 1280×720 thumbnail for one episode. */
export const Thumbnail: React.FC<{ episode: number }> = ({ episode }) => {
  const thumb = THUMBS.find((t) => t.episode === episode) ?? THUMBS[0];
  if (!thumb) return null;
  return (
    <AbsoluteFill style={{ background: thumb.background }}>
      <AbsoluteFill>{thumb.scene}</AbsoluteFill>
      {/* Darken the left side a little so the words pop */}
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,15,35,0.45) 0%, rgba(5,15,35,0.15) 40%, rgba(5,15,35,0) 60%)" }} />
      <AbsoluteFill style={{ padding: "54px 60px", justifyContent: "center" }}>
        <Headline lines={thumb.lines} />
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 40,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: 2,
          color: "#0b1a33",
          background: "#ffd23f",
          padding: "8px 20px",
          borderRadius: 999,
          boxShadow: "0 6px 0 #0b1a33",
        }}
      >
        FLYING MADE SIMPLE · EP {thumb.episode}
      </div>
    </AbsoluteFill>
  );
};
