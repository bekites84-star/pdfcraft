import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../Airplane";
import { CloudField, Stage, SUNSET, useGrow } from "../common";
import { FORCE_COLORS } from "./Forces";
import { wordFrame, type SceneTimeline } from "../timeline";

const Line: React.FC<{ show: number; children: React.ReactNode }> = ({ show, children }) => (
  <div style={{ opacity: show, transform: `translateX(${(1 - show) * -40}px)`, marginTop: 18 }}>{children}</div>
);

export const Outro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = interpolate(frame, [0, scene.durationInFrames], [0, 1]);
  const one = useGrow(wordFrame(scene, "lift", 0, 30), 200);
  const two = useGrow(wordFrame(scene, "thrust", 0, 80), 200);
  const three = useGrow(wordFrame(scene, "airplane", 0, 140), 200);
  const thanks = useGrow(wordFrame(scene, "thanks", 0, 190), 12);
  return (
    <AbsoluteFill>
      <Stage background={SUNSET} camera={{ position: [-4, 1.5, 14] }} lookAt={[2, 1, 0]}>
        <CloudField speed={1.5} count={10} seed="outro" y={[-5, -1]} />
        <group position={[interpolate(k, [0, 1], [2, 9]), interpolate(k, [0, 1], [0.5, 3]), interpolate(k, [0, 1], [0, -18])]} rotation={[0.1, -0.9, 0.15]}>
          <Airplane fan={t * 30} />
        </group>
      </Stage>
      <AbsoluteFill style={{ padding: "120px 110px", fontFamily: "system-ui, sans-serif", color: "white", textShadow: "0 4px 18px rgba(0,0,0,0.35)" }}>
        <div style={{ fontSize: 60, fontWeight: 900 }}>
          <Line show={one}>
            <span style={{ color: "#8ff0b4" }}>LIFT</span> beats <span style={{ color: "#ff9fa2" }}>WEIGHT</span> → up ⬆️
          </Line>
          <Line show={two}>
            <span style={{ color: "#a9c9ff" }}>THRUST</span> beats <span style={{ color: FORCE_COLORS.drag }}>DRAG</span> → forward ➡️
          </Line>
          <Line show={three}>= the airplane flies! ✈️</Line>
        </div>
        <div style={{ marginTop: 70, fontSize: 84, fontWeight: 900, opacity: thanks, transform: `scale(${0.7 + 0.3 * thanks})`, transformOrigin: "left" }}>
          Thanks for watching!
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
