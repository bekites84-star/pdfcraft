import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Label3D, Stage } from "../../lib/common";
import { InfoCard, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { bump } from "../shake";

/** Front three-quarter view: the wings visibly flex as the plane rides the bumps. */
export const Strong: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const bendAt = wordFrame(scene, "bend", 0, 90);
  const testAt = wordFrame(scene, "tested", 0, 200);
  const flexOn = ramp(frame, bendAt - 10, bendAt + 10);
  const flex = 0.02 + flexOn * (0.05 + 0.05 * Math.sin(t * 5.5));
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [9, 1.2, 9.5] }} lookAt={[0, 0.3, 0]}>
        <CloudField speed={3} count={14} seed="ep5-strong" />
        <group position={[0, bump(t) * 0.12, 0]} rotation={[bump(t, 2) * 0.03, 0, bump(t, 6) * 0.02]}>
          <Airplane fan={t * 30} wingFlex={flex} />
        </group>
        <Label3D position={[-0.5, 1.9, 4.3]} text="wings bend & flex" background="#2f7cf6" opacity={flexOn} height={0.55} />
      </Stage>
      <InfoCard corner="tr" show={ramp(frame, testAt - 10, testAt + 5)} style={{ maxWidth: 620 }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: "#51607a" }}>BUILT TOUGH 💪</div>
        <div style={{ fontSize: 38, fontWeight: 800, color: "#0d2340" }}>Tested to 1.5× the strongest loads it should ever meet</div>
      </InfoCard>
    </AbsoluteFill>
  );
};
