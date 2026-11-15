import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { bump } from "../shake";

const SPAN = 30;
const wrap = (x: number) => ((((x + SPAN / 2) % SPAN) + SPAN) % SPAN) - SPAN / 2;
/** Height of the boundary between the fast jet stream (above) and slower air (below). */
const SHEAR_Y = 1.6;

/** Clear sky with a fast jet stream on top of slow air; eddies where they rub; a pilot report. */
export const ClearAir: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const jetAt = wordFrame(scene, "jet", 0, 70);
  const rubAt = wordFrame(scene, "rub", 0, 120);
  const reportAt = wordFrame(scene, "reports", 0, 200);
  const jet = ramp(frame, jetAt - 10, jetAt + 10);
  const rub = ramp(frame, rubAt - 5, rubAt + 15);
  const px = -9 + (frame / scene.durationInFrames) * 16;
  const inShear = Math.max(0, 1 - Math.abs(px - 0) / 6) * rub;
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #1858b8 0%, #3f86dc 55%, #8fc2f2 100%)" camera={{ position: [0, 0.8, 19] }} lookAt={[0, 0.8, 0]}>
        {/* Jet stream: long, fast streaks */}
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 16 }, (_, i) => (
            <mesh key={`j${row}-${i}`} position={[wrap((i / 16) * SPAN + t * 9 + row * 1.3), SHEAR_Y + 0.7 + row * 0.75, -2]} scale={[9, 1, 1]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshStandardMaterial color="#e6f6ff" emissive="#bfe6ff" emissiveIntensity={0.9} transparent opacity={0.25 + 0.75 * jet} />
            </mesh>
          )),
        )}
        {/* Slow air below: short, lazy dots */}
        {Array.from({ length: 5 }, (_, row) =>
          Array.from({ length: 16 }, (_, i) => (
            <mesh key={`s${row}-${i}`} position={[wrap((i / 16) * SPAN + t * 1.5 + row * 0.9), SHEAR_Y - 0.8 - row * 0.8, -2]} scale={[1.6, 1, 1]}>
              <sphereGeometry args={[0.07, 8, 6]} />
              <meshStandardMaterial color="#ffffff" emissive="#dbeeff" emissiveIntensity={0.7} />
            </mesh>
          )),
        )}
        {/* Eddies rolling along the boundary */}
        {Array.from({ length: 6 }, (_, e) => {
          const cx = wrap(e * 5 + t * 4.5);
          return Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2 - t * 3;
            return (
              <mesh key={`e${e}-${i}`} position={[cx + Math.cos(a) * 0.8, SHEAR_Y + Math.sin(a) * 0.55, -1.8]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#fff3c4" emissive="#ffe08a" emissiveIntensity={0.7} transparent opacity={rub} />
              </mesh>
            );
          });
        })}
        <group position={[px, SHEAR_Y + bump(t) * 0.4 * inShear, 0]} rotation={[bump(t, 4) * 0.1 * inShear, -0.12, bump(t, 8) * 0.05 * inShear]} scale={0.55}>
          <Airplane fan={t * 30} wingFlex={bump(t, 2) * 0.03 * inShear} />
        </group>
        <Label3D position={[-0.5, SHEAR_Y + 3.7, 0]} text="jet stream: super-fast wind" background="#2f7cf6" opacity={jet} height={0.85} />
        <Label3D position={[6, SHEAR_Y - 5, 0]} text="slower air" background="#51607a" opacity={jet} height={0.75} />
        <Label3D position={[5.5, SHEAR_Y - 1.5, 0]} text="bumpy where they rub" background="#e5484d" opacity={rub} height={0.75} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, reportAt - 5, reportAt + 10)} style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>📻 PILOT REPORT</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: "#0d2340" }}>“Bumpy at 35,000 feet. Try 31,000!”</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
