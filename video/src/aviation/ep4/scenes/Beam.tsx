import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Airplane, GEAR_HEIGHT } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { Ground, InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const GLIDE = (3 * Math.PI) / 180;
const TOUCHDOWN_X = -22;
const SPEED = 5;
const FOG = "#c4ccd6";

/** Landing in thick fog, riding a glowing radio beam down to the runway. */
export const Beam: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const x = TOUCHDOWN_X - 14 - SPEED * (scene.durationInFrames / fps - t);
  const y = GEAR_HEIGHT + (TOUCHDOWN_X - x) * Math.tan(GLIDE);
  const beamAt = wordFrame(scene, "beam", 0, 60);
  const beam = ramp(frame, beamAt - 5, beamAt + 15);
  const fogAt = wordFrame(scene, "fog", 0, 220);
  const fogCard = ramp(frame, fogAt - 10, fogAt + 5);
  const len = 140;
  return (
    <AbsoluteFill>
      <Stage background={`linear-gradient(180deg, #aab4c0 0%, ${FOG} 60%)`} camera={{ position: [x - 11, y + 2.6, 4.5], fov: 45 }} lookAt={[x + 9, y - 1.2, 0]}>
        <fog attach="fog" args={[FOG, 6, 45]} />
        <Ground />
        {/* Runway edge lights shine through the fog */}
        {Array.from({ length: 40 }, (_, i) =>
          [-3.1, 3.1].map((z) => (
            <mesh key={`${i}${z}`} position={[-30 + i * 4, 0.1, z]}>
              <sphereGeometry args={[0.12, 8, 6]} />
              <meshBasicMaterial color="#fff2c2" fog={false} />
            </mesh>
          )),
        )}
        {Array.from({ length: 10 }, (_, i) => (
          <mesh key={`a${i}`} position={[-33 - i * 3, 0.25, 0]}>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshBasicMaterial color={i === Math.floor((t * 10) % 10) ? "#ffffff" : "#ffe27a"} fog={false} />
          </mesh>
        ))}
        {/* The radio beam: a glowing wedge rising from the touchdown point along the 3° path */}
        <group position={[TOUCHDOWN_X, GEAR_HEIGHT, 0]} rotation={[0, 0, Math.PI - GLIDE]}>
          <mesh position={[len / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} visible={beam > 0.01}>
            <coneGeometry args={[4, len, 4, 1, true]} />
            <meshBasicMaterial color="#3df58f" transparent opacity={0.14 * beam} side={THREE.DoubleSide} depthWrite={false} fog={false} />
          </mesh>
          <mesh position={[len / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]} visible={beam > 0.01}>
            <cylinderGeometry args={[0.04, 0.04, len, 6]} />
            <meshBasicMaterial color="#3df58f" transparent opacity={0.8 * beam} fog={false} />
          </mesh>
        </group>
        <group position={[x, y, 0]} rotation={[0, 0, 0.03]}>
          <Airplane fan={t * 10} gear={1} flaps={1} />
        </group>
        <Label3D position={[x + 10, y + 0.3, 0]} text="radio beam" background="#1f9d55" opacity={beam} height={0.9} />
      </Stage>
      <InfoCard corner="tr" show={fogCard}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>CAN'T SEE THE RUNWAY?</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#1f9d55" }}>The beam guides the way 📡</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
