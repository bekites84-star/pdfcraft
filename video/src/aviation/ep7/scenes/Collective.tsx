import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Arrow, FORCE_COLORS, Stage } from "../../lib/common";
import { Helicopter, ROTOR_Y, SKID_HEIGHT } from "../../lib/Helicopter";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Downwash, Field, Helipad, spin } from "../world";

/** The collective lever, drawn as a side view: it pivots up from the floor. */
const Lever: React.FC<{ k: number }> = ({ k }) => {
  const ang = -10 - 28 * k;
  return (
    <svg width={300} height={220}>
      <rect x={20} y={180} width={260} height={18} rx={6} fill="#2a2f38" />
      <g transform={`rotate(${ang} 60 180)`}>
        <rect x={60} y={170} width={200} height={20} rx={10} fill="#4a515d" />
        <rect x={220} y={160} width={56} height={40} rx={10} fill="#1b1f26" />
      </g>
      <text x={150} y={30} textAnchor="middle" fontFamily="system-ui" fontSize={28} fontWeight={800} fill="#0d2340">
        {k > 0.5 ? "pulled UP" : "down"}
      </text>
    </svg>
  );
};

/** Pulling the collective adds blade angle, the downwash grows, and the helicopter climbs. */
export const Collective: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const pullAt = wordFrame(scene, "pulls", 0, 50);
  const tiltAt = wordFrame(scene, "tilts", 0, 130);
  const upAt = Math.max(tiltAt + 20, wordFrame(scene, "up", 1, 220));
  const lever = ramp(frame, pullAt, pullAt + 25);
  const pitch = interpolate(lever, [0, 1], [0.04, 0.32]);
  const rise = interpolate(frame, [upAt - 25, upAt + 45], [0, 4.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) });
  const y = SKID_HEIGHT + rise;
  const lift = ramp(frame, tiltAt, tiltAt + 15);
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [1, 3.6, 15], fov: 42 }} lookAt={[0, 3.6 + rise * 0.5, 0]}>
        <Field />
        <Helipad />
        <Downwash position={[0, 0, 0]} strength={lever * (1 - rise / 9)} />
        <group position={[0, y, 0]}>
          <Helicopter rotor={spin(t, 5 + 9 * lever)} tail={spin(t, 40)} blur={0.4 + 0.6 * lever} collective={pitch} />
          <Arrow origin={[0, ROTOR_Y + 0.25, 0]} dir={[0, 1, 0]} length={1 + 2 * lift} color={FORCE_COLORS.lift} progress={lift} label="more LIFT" labelOffset={[0, 0.5, 0]} thickness={0.12} labelHeight={0.6} />
        </group>
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, pullAt - 15, pullAt)}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>THE COLLECTIVE</div>
        <Lever k={lever} />
        <div style={{ fontSize: 32, fontWeight: 800, color: "#b38600", opacity: lift }}>more blade angle → more lift</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
