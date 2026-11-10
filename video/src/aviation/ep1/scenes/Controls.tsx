import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const MOVES = [
  { key: "roll", name: "ROLL", part: "ailerons on the wings", hint: "tilt left & right" },
  { key: "pitch", name: "PITCH", part: "elevators on the tail", hint: "nose up & down" },
  { key: "yaw", name: "YAW", part: "rudder on the tail", hint: "turn side to side" },
] as const;

export const Controls: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const all = wordFrame(scene, "flaps", 0, 45);
  const roll = wordFrame(scene, "flaps", 1, 140);
  const pitch = wordFrame(scene, "point", 0, 260) - 12;
  const yaw = wordFrame(scene, "turn", 0, 360) - 8;

  const phase: number = frame >= yaw ? 2 : frame >= pitch ? 1 : frame >= roll ? 0 : -1;
  const phaseStart = [roll, pitch, yaw][phase] ?? 0;
  const local = (frame - phaseStart) / fps;
  const env = phase >= 0 ? interpolate(local, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) : 0;
  const wave = Math.sin(local * Math.PI * 0.9) * env;
  const lag = Math.sin((local - 0.35) * Math.PI * 0.9) * env * (local > 0.35 ? 1 : 0);

  const showAll = frame >= all && frame < roll;
  const aileron = phase === 0 ? 0.4 * wave : 0;
  const elevator = phase === 1 ? 0.4 * wave : 0;
  const rudder = phase === 2 ? 0.4 * wave : 0;
  const bank = phase === 0 ? -0.55 * lag : 0;
  const nose = phase === 1 ? 0.3 * lag : 0;
  const turn = phase === 2 ? 0.35 * lag : 0;

  const move = MOVES[phase as 0 | 1 | 2] ?? null;
  const badge = interpolate(local, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-10.5, 4.6, 8.5] }} lookAt={[0, 0.2, 0]}>
        <CloudField speed={2} count={12} seed="controls" />
        <group rotation={[0, turn, 0]}>
          <group rotation={[0, 0, nose]}>
            <group rotation={[bank, 0, 0]}>
              <Airplane
                fan={t * 30}
                aileron={aileron}
                elevator={elevator}
                rudder={rudder}
                highlight={{
                  ailerons: showAll || phase === 0,
                  elevator: showAll || phase === 1,
                  rudder: showAll || phase === 2,
                }}
              />
            </group>
          </group>
        </group>
      </Stage>
      {move ? (
        <AbsoluteFill style={{ alignItems: "flex-end", padding: 56, fontFamily: "system-ui, sans-serif" }}>
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              borderRadius: 24,
              padding: "20px 34px",
              textAlign: "right",
              opacity: badge,
              transform: `translateY(${(1 - badge) * -20}px)`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: 76, fontWeight: 900, color: "#0d2340" }}>{move.name}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: "#b38600" }}>{move.part}</div>
            <div style={{ fontSize: 32, fontWeight: 600, color: "#51607a" }}>{move.hint}</div>
          </div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
