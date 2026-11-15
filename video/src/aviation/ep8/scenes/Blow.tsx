import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Arrow, Label3D } from "../../lib/common";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { TURB } from "../engine";
import { EngineStage, StepBadge } from "../common";

/** Hot gas spins the turbine, the shaft carries that spin forward to the fan. */
export const Blow: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const turbAt = wordFrame(scene, "turbine", 0, 90);
  const shaftAt = wordFrame(scene, "shaft", 0, 150);
  const keepAt = wordFrame(scene, "itself", 0, 230);
  const shaft = ramp(frame, shaftAt - 5, shaftAt + 10);
  return (
    <AbsoluteFill>
      <EngineStage camera={[-1.0, 2.6, 10.5]} lookAt={[0.2, 0, 0]} engine={{ highlight: { turbine: frame >= turbAt - 5, shaft: frame >= shaftAt - 5 }, core: 1, bypass: 0.2 }}>
        <Label3D position={[(TURB[0] + TURB[1]) / 2, 1.35, 0]} text="turbine" background="#b0179b" opacity={ramp(frame, turbAt, turbAt + 10)} height={0.6} />
        <Arrow origin={[-1.2, 0.35, 0.6]} dir={[1, 0, 0]} length={4.2} color="#ffd23f" progress={shaft} label="spin goes to the fan" labelOffset={[-1.8, 0.55, 0]} thickness={0.07} labelHeight={0.55} />
        <Label3D position={[-5.2, -1.4, 0]} text="hot gas out → PUSH" background="#e5484d" opacity={ramp(frame, keepAt - 20, keepAt)} height={0.6} />
      </EngineStage>
      <StepBadge n={4} word="BLOW" color="#e5484d" show={ramp(frame, 0, 12)} />
    </AbsoluteFill>
  );
};
