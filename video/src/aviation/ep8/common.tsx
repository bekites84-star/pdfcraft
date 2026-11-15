import { useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../lib/common";
import { JetEngine, type EngineProps } from "./engine";

export const WORKSHOP = "radial-gradient(circle at 50% 45%, #2b3a55 0%, #121a29 75%)";

/** The cut-away engine on a dark stage; the shaft spins steadily. */
export const EngineStage: React.FC<{
  camera: [number, number, number];
  lookAt: [number, number, number];
  fov?: number;
  engine?: Omit<EngineProps, "spin" | "t">;
  children?: React.ReactNode;
}> = ({ camera, lookAt, fov = 40, engine, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <Stage background={WORKSHOP} camera={{ position: camera, fov }} lookAt={lookAt}>
      <pointLight position={[2, 3, 6]} intensity={30} distance={20} color="#ffffff" />
      <JetEngine spin={t * 6} t={t} {...engine} />
      {children}
    </Stage>
  );
};

/** A coloured step badge: 1 SUCK, 2 SQUEEZE … */
export const StepBadge: React.FC<{ n: number; word: string; color: string; show: number }> = ({ n, word, color, show }) => (
  <div
    style={{
      position: "absolute",
      right: 70,
      top: 56,
      display: "flex",
      alignItems: "center",
      gap: 18,
      opacity: show,
      transform: `scale(${0.8 + 0.2 * show})`,
      transformOrigin: "right top",
      fontFamily: "system-ui, sans-serif",
    }}
  >
    <span style={{ width: 84, height: 84, borderRadius: 42, background: color, color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 900 }}>{n}</span>
    <span style={{ fontSize: 96, fontWeight: 900, color: "white", textShadow: `0 6px 0 ${color}, 0 10px 30px rgba(0,0,0,0.5)` }}>{word}</span>
  </div>
);
