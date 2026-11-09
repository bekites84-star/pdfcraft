import { random, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

/** Grass, a runway along +x (from x = -30 to 150) with markings, and a row of trees. */
export const Ground: React.FC = () => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, 0, 0]}>
      <planeGeometry args={[400, 200]} />
      <meshStandardMaterial color="#6fb35f" roughness={1} />
    </mesh>
    <mesh position={[60, 0.01, 0]}>
      <boxGeometry args={[180, 0.02, 6]} />
      <meshStandardMaterial color="#4a4f58" roughness={0.9} />
    </mesh>
    {Array.from({ length: 45 }, (_, i) => (
      <mesh key={i} position={[-25 + i * 4, 0.03, 0]}>
        <boxGeometry args={[2, 0.01, 0.18]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}
    {[-2.8, 2.8].map((z) => (
      <mesh key={z} position={[60, 0.03, z]}>
        <boxGeometry args={[180, 0.01, 0.1]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    ))}
    {Array.from({ length: 30 }, (_, i) => (
      <group key={i} position={[-20 + i * 6.5, 0, -9 - (i % 3) * 2.5]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 1, 8]} />
          <meshStandardMaterial color="#7a5232" />
        </mesh>
        <mesh position={[0, 1.7, 0]}>
          <coneGeometry args={[0.8, 2.2, 12]} />
          <meshStandardMaterial color="#2f7d3c" />
        </mesh>
      </group>
    ))}
  </group>
);

/** A labelled horizontal gauge; `value` 1.0 fills 80 %. */
export const Bar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
    <div style={{ width: 170, fontWeight: 800, fontSize: 34, color }}>{label}</div>
    <div style={{ width: 360, height: 30, borderRadius: 15, background: "rgba(13,35,64,0.15)", overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value * 80)}%`, height: "100%", background: color, borderRadius: 15 }} />
    </div>
  </div>
);


/** A snowy mountain peak. */
export const Mountain: React.FC<{ position: [number, number, number]; height: number; radius: number; seed?: number }> = ({
  position,
  height,
  radius,
  seed = 0,
}) => {
  const snow = 0.32;
  return (
    <group position={position} rotation={[0, random(`m${seed}`) * Math.PI, 0]}>
      <mesh position={[0, height / 2, 0]}>
        <coneGeometry args={[radius, height, 7, 1]} />
        <meshStandardMaterial color="#6d7787" roughness={1} flatShading />
      </mesh>
      <mesh position={[0, height * (1 - snow / 2), 0]}>
        <coneGeometry args={[radius * snow * 1.04, height * snow, 7, 1]} />
        <meshStandardMaterial color="#f7fbff" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
};

/** Grey tyre-smoke puffs that grow and fade after `at` (frame), at a wheel position. */
export const SmokePuff: React.FC<{ at: number; position: [number, number, number]; drift: number }> = ({ at, position, drift }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - at) / fps;
  if (t < 0 || t > 1.6) return null;
  return (
    <group position={position}>
      {Array.from({ length: 5 }, (_, i) => {
        const k = t / 1.6;
        const r = 0.15 + k * (0.5 + random(`p${i}`) * 0.3);
        return (
          <mesh key={i} position={[-drift * t - i * 0.15, 0.1 + k * 0.4 * random(`py${i}`), (random(`pz${i}`) - 0.5) * 0.5]}>
            <sphereGeometry args={[r, 12, 10]} />
            <meshStandardMaterial color="#e6e8ec" transparent opacity={(1 - k) * 0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  borderRadius: 24,
  padding: "22px 32px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  fontFamily: "system-ui, sans-serif",
};

/** Episode title card: series name, episode number, title and subtitle. */
export const IntroTitle: React.FC<{ series: string; episode: number; title: string; subtitle: string; grow: number; sub: number }> = ({
  series,
  episode,
  title,
  subtitle,
  grow,
  sub,
}) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 90, fontFamily: "system-ui, sans-serif" }}>
    <div
      style={{
        fontSize: 34,
        fontWeight: 800,
        letterSpacing: 3,
        color: "#0d2340",
        background: "rgba(255,255,255,0.88)",
        padding: "8px 24px",
        borderRadius: 999,
        opacity: sub,
        textTransform: "uppercase",
      }}
    >
      {series} · Episode {episode}
    </div>
    <div style={{ fontSize: 112, fontWeight: 900, color: "white", textShadow: "0 8px 30px rgba(10,40,90,0.45)", marginTop: 18, transform: `scale(${0.6 + 0.4 * grow})`, opacity: grow }}>
      {title}
    </div>
    <div style={{ fontSize: 44, fontWeight: 700, color: "#eaf4ff", marginTop: 8, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)` }}>{subtitle}</div>
  </div>
);

/** A recap checklist whose items tick in one by one (`shown[i]` 0..1). */
export const Checklist: React.FC<{ items: string[]; shown: number[]; footer: string; footerShown: number }> = ({ items, shown, footer, footerShown }) => (
  <div style={{ position: "absolute", left: 110, top: 110, fontFamily: "system-ui, sans-serif", color: "white", textShadow: "0 4px 18px rgba(0,0,0,0.35)" }}>
    {items.map((item, i) => {
      const k = shown[i] ?? 0;
      return (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 16, opacity: k, transform: `translateX(${(1 - k) * -40}px)`, fontSize: 60, fontWeight: 900 }}>
          <span style={{ display: "inline-flex", width: 64, height: 64, borderRadius: 18, background: "#22b35e", alignItems: "center", justifyContent: "center", fontSize: 44, textShadow: "none" }}>✓</span>
          {item}
        </div>
      );
    })}
    <div style={{ marginTop: 56, fontSize: 76, fontWeight: 900, opacity: footerShown, transform: `scale(${0.7 + 0.3 * footerShown})`, transformOrigin: "left" }}>{footer}</div>
  </div>
);

/** A white info card pinned to a corner of the frame. */
export const InfoCard: React.FC<{ corner?: "tr" | "tl" | "br" | "bl"; show?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  corner = "tr",
  show = 1,
  children,
  style,
}) => {
  const pos: React.CSSProperties = {
    position: "absolute",
    ...(corner.includes("t") ? { top: corner === "tl" ? 150 : 56 } : { bottom: 170 }),
    ...(corner.includes("r") ? { right: 56 } : { left: 56 }),
  };
  return <div style={{ ...card, ...pos, opacity: show, transform: `translateY(${(1 - show) * -16}px)`, ...style }}>{children}</div>;
};

export const ramp = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
