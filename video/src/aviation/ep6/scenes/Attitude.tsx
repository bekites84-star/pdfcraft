import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { AttitudeIndicator } from "../instruments";

const clampOpts = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** A 3D plane pitches and banks; the attitude indicator beside it shows the same thing. */
export const Attitude: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const blueAt = wordFrame(scene, "blue", 0, 60);
  const brownAt = wordFrame(scene, "brown", 0, 90);
  const noseAt = Math.max(30, wordFrame(scene, "nose", 0, 140));
  const tiltAt = Math.max(noseAt + 75, wordFrame(scene, "tilted", 0, 220));
  const cloudAt = Math.max(tiltAt + 30, wordFrame(scene, "cloud", 0, 290));
  const pitch = interpolate(frame, [noseAt, noseAt + 20, noseAt + 40, noseAt + 60, noseAt + 75], [0, 10, 10, -6, 0], clampOpts);
  const roll = interpolate(frame, [tiltAt, tiltAt + 20, tiltAt + 45, tiltAt + 70, tiltAt + 90], [0, 25, 25, -20, -8], clampOpts);
  const fog = ramp(frame, cloudAt - 20, cloudAt + 10);
  const d2r = Math.PI / 180;
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-13, 1.6, 0.0001], fov: 40 }} lookAt={[0, 0.4, 3.4]}>
        <fog attach="fog" args={["#c9d1db", interpolate(fog, [0, 1], [200, 4]), interpolate(fog, [0, 1], [400, 14])]} />
        <CloudField speed={4} count={14} seed="ep6-att" y={[-6, 4]} z={[-25, 25]} />
        <group position={[0, 0, 0]} rotation={[0, 0, pitch * d2r]}>
          <group rotation={[roll * d2r, 0, 0]}>
            <Airplane fan={t * 30} aileron={roll > 3 ? 0.2 : roll < -3 ? -0.2 : 0} />
          </group>
        </group>
      </Stage>
      <div style={{ position: "absolute", right: 90, top: 210 }}>
        <AttitudeIndicator pitch={pitch} roll={roll} size={560} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 6, fontFamily: "system-ui", fontWeight: 900, fontSize: 36 }}>
          <span style={{ background: "#2f7fd6", color: "white", padding: "6px 18px", borderRadius: 12, opacity: ramp(frame, blueAt, blueAt + 8) }}>BLUE = SKY</span>
          <span style={{ background: "#8a5a2b", color: "white", padding: "6px 18px", borderRadius: 12, opacity: ramp(frame, brownAt, brownAt + 8) }}>BROWN = GROUND</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
