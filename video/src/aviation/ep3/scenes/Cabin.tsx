import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

/** Icy air streaming past outside; the cabin windows glow warm once air is pumped in. */
export const Cabin: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const thinAt = wordFrame(scene, "breathe", 0, 60);
  const coldAt = wordFrame(scene, "cold", 0, 110);
  const warmAt = wordFrame(scene, "warm", 0, 200);
  const comfyAt = wordFrame(scene, "comfy", 0, 260);
  const glow = ramp(frame, warmAt, warmAt + 30);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #0f2f66 0%, #2a64b8 60%, #78b3ef 100%)" camera={{ position: [1, 1.2, 9] }} lookAt={[0.3, 0, 0]}>
        {Array.from({ length: 70 }, (_, i) => {
          const u = (((random(`ice-${i}`) + t * 0.7) % 1) + 1) % 1;
          return (
            <mesh key={i} position={[8 - u * 18, (random(`iy-${i}`) - 0.5) * 7, (random(`iz-${i}`) - 0.5) * 6]} scale={[3, 1, 1]}>
              <sphereGeometry args={[0.035, 6, 6]} />
              <meshStandardMaterial color="#e6f4ff" emissive="#b8dcff" emissiveIntensity={0.8} />
            </mesh>
          );
        })}
        <group rotation={[0, -0.12, 0]}>
          <Airplane fan={t * 30} cabinGlow={glow} />
        </group>
        <Label3D position={[0.8, -1.4, 1.2]} text="warm air pumped in" background="#f08a24" opacity={glow} height={0.38} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, thinAt, thinAt + 12)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>OUTSIDE</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#0d2340" }}>air too thin to breathe</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#2f7cf6", opacity: ramp(frame, coldAt, coldAt + 12) }}>−50 °C 🥶</div>
      </InfoCard>
      <InfoCard corner="tl" show={ramp(frame, comfyAt - 15, comfyAt)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>INSIDE</div>
        <div style={{ fontSize: 34, fontWeight: 800, color: "#0d2340" }}>comfy cabin air</div>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#f08a24" }}>+22 °C 😊</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
