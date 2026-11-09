import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const SCOPE_R = 8;
/** Traffic: start position, heading (radians, 0 = +x), speed, call sign and flight level. */
const TRAFFIC: { from: [number, number]; heading: number; speed: number; tag: string }[] = [
  { from: [-7, -2], heading: 0.15, speed: 0.55, tag: "SKY12  FL350" },
  { from: [5, -6], heading: 2.2, speed: 0.5, tag: "CLD45  FL370" },
  { from: [-2, 6], heading: -1.2, speed: 0.45, tag: "SUN7  FL330" },
  { from: [6, 4], heading: 3.6, speed: 0.4, tag: "RVR88  FL390" },
];

/** A controller's radar scope: sweeping beam, glowing blips with tags, separation circles. */
export const Atc: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const sweep = (t * 1.6) % (Math.PI * 2);
  const radarAt = wordFrame(scene, "radar", 0, 60);
  const lightsAt = wordFrame(scene, "traffic", 0, 120);
  const apartAt = wordFrame(scene, "apart", 0, 200);
  const heightAt = wordFrame(scene, "height", 0, 240);
  const tags = ramp(frame, radarAt, radarAt + 15);
  const apart = ramp(frame, apartAt - 5, apartAt + 10);
  const levels = ramp(frame, heightAt - 5, heightAt + 10);
  return (
    <AbsoluteFill>
      <Stage background="radial-gradient(circle at 50% 50%, #0b2216 0%, #020806 80%)" camera={{ position: [0, 24, 7], fov: 40 }} lookAt={[0, 0, 0.6]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[SCOPE_R, 96]} />
          <meshBasicMaterial color="#06331d" />
        </mesh>
        {[2.5, 5, 7.5].map((r) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[r - 0.03, r + 0.03, 96]} />
            <meshBasicMaterial color="#1f9d55" transparent opacity={0.6} />
          </mesh>
        ))}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[SCOPE_R - 0.08, SCOPE_R, 96]} />
          <meshBasicMaterial color="#3df58f" />
        </mesh>
        {/* Sweep: a fading wedge trailing the beam */}
        <mesh rotation={[-Math.PI / 2, 0, sweep]} position={[0, 0.03, 0]}>
          <circleGeometry args={[SCOPE_R, 48, -0.6, 0.6]} />
          <meshBasicMaterial color="#3df58f" transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {TRAFFIC.map((p, i) => {
          const x = p.from[0] + Math.cos(p.heading) * p.speed * t;
          const z = p.from[1] - Math.sin(p.heading) * p.speed * t;
          // Blips flare when the beam passes over them, then fade.
          const angle = Math.atan2(-z, x);
          const since = (((sweep - angle) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
          const glow = 0.35 + 0.65 * Math.exp(-since * 1.5);
          return (
            <group key={i} position={[x, 0.05, z]}>
              <mesh rotation={[-Math.PI / 2, 0, p.heading - Math.PI / 2]}>
                <circleGeometry args={[0.28, 3]} />
                <meshBasicMaterial color="#b6ffd2" transparent opacity={glow} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} visible={apart > 0.01}>
                <ringGeometry args={[1.45, 1.53, 48]} />
                <meshBasicMaterial color="#ffd84a" transparent opacity={0.7 * apart} />
              </mesh>
              <Label3D position={[0.3, 0.2, -0.9]} text={p.tag} background="rgba(10,60,32,0.9)" opacity={tags * (0.7 + 0.3 * levels)} height={0.75} />
            </group>
          );
        })}
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, lightsAt - 5, lightsAt + 10)} style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>AIR TRAFFIC CONTROL 🎧</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#0d2340" }}>Like traffic lights for the sky 🚦</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#b38600", marginTop: 10, opacity: levels }}>Each plane gets its own height (FL350 = 35,000 ft)</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
