import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, Stage } from "../../lib/common";
import { Helicopter, SKID_HEIGHT } from "../../lib/Helicopter";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Field, Helipad, spin } from "../world";

const MOVES: { dir: [number, number]; label: string }[] = [
  { dir: [1, 0], label: "FORWARD" },
  { dir: [0, 1], label: "SIDEWAYS" },
  { dir: [-1, 0], label: "BACKWARD" },
];
const PHASE = 52; // frames per move
const SPEED = 2.6; // units per second

/** The cyclic stick, seen from above: the knob leans the way the rotor tilts. */
const Stick: React.FC<{ dx: number; dz: number }> = ({ dx, dz }) => (
  <svg width={220} height={220}>
    <circle cx={110} cy={110} r={90} fill="#e9edf3" stroke="#9aa3b1" strokeWidth={4} />
    <line x1={110} y1={110} x2={110 + dz * 60} y2={110 - dx * 60} stroke="#2a2f38" strokeWidth={14} strokeLinecap="round" />
    <circle cx={110 + dz * 60} cy={110 - dx * 60} r={22} fill="#1b1f26" />
    <text x={110} y={20} textAnchor="middle" fontFamily="system-ui" fontSize={20} fontWeight={800} fill="#51607a">
      NOSE
    </text>
  </svg>
);

/** Tilting the rotor disc forward, sideways, then backward moves the helicopter each way. */
export const Cyclic: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const start = wordFrame(scene, "cyclic", 0, 90) + 4;
  /** Lean toward each move's direction, easing in and out within its phase. */
  const lean = (f: number): [number, number, number] => {
    const p = Math.floor((f - start) / PHASE);
    const move = MOVES[p];
    if (f < start || !move) return [0, 0, -1];
    const u = (f - start - p * PHASE) / PHASE;
    const k = Math.sin(Math.PI * Math.min(1, Math.max(0, u)));
    return [move.dir[0] * k, move.dir[1] * k, p];
  };
  let x = 0;
  let z = 0;
  for (let f = 0; f < frame; f++) {
    const [dx, dz] = lean(f);
    x += (dx * SPEED) / fps;
    z += (dz * SPEED) / fps;
  }
  const [dx, dz, phase] = lean(frame);
  const move = MOVES[phase];
  const y = SKID_HEIGHT + 2.6 + Math.sin(t * 1.5) * 0.06;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [x * 0.6 - 2, 6, 15 + z * 0.4], fov: 42 }} lookAt={[x * 0.8, 2.6, z * 0.6]}>
        <Field />
        <Helipad />
        <group position={[x, y, z]}>
          <group rotation={[dz * 0.12, 0, -dx * 0.12]}>
            <Helicopter rotor={spin(t)} tail={spin(t, 40)} blur={1} tilt={[dx * 0.2, dz * 0.2]} />
          </group>
          {move ? <Arrow origin={[move.dir[0] * 2.2, -0.6, move.dir[1] * 2.2]} dir={[move.dir[0], 0, move.dir[1]]} length={3.2} color="#f08a24" progress={Math.max(Math.abs(dx), Math.abs(dz))} label={move.label} labelOffset={[0, 0.9, 0]} thickness={0.2} labelHeight={0.95} /> : null}
        </group>
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, start - 25, start - 10)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>THE CYCLIC</div>
        <Stick dx={dx} dz={dz} />
        <div style={{ fontSize: 30, fontWeight: 800, color: "#b38600", opacity: interpolate(frame, [start, start + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          tilt the rotor → go that way
        </div>
      </InfoCard>
    </AbsoluteFill>
  );
};
