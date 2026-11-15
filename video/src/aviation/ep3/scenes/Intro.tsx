import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { Cloud, Label3D, Stage, useGrow } from "../../lib/common";
import { IntroTitle, Mountain, ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const k = frame / scene.durationInFrames;
  const everestAt = wordFrame(scene, "everest", 0, 120);
  const tags = ramp(frame, everestAt, everestAt + 12);
  const px = interpolate(k, [0, 1], [-6, 5]);
  return (
    <AbsoluteFill>
      <Stage background="linear-gradient(180deg, #1f5fae 0%, #4f97e0 50%, #b9dcff 100%)" camera={{ position: [0, 0, 20] }} lookAt={[0, -1, 0]}>
        <Mountain position={[3, -14.5, -6]} height={9} radius={6} seed={1} />
        <Mountain position={[-7, -14.5, -10]} height={6} radius={5} seed={2} />
        <Mountain position={[11, -14.5, -12]} height={7} radius={5.5} seed={3} />
        {[-10, -3, 5, 11].map((x, i) => (
          <Cloud key={i} seed={i + 20} position={[x, -11.4 + (i % 2) * 0.6, -3]} scale={1.6} />
        ))}
        <group position={[px, -2.2, 0]} rotation={[0, -0.4, 0]} scale={0.75}>
          <Airplane fan={t * 25} />
        </group>
        <Label3D position={[px, -0.6, 0]} text="plane: 11 km" background="#2f7cf6" opacity={tags} height={0.9} />
        <Label3D position={[9, -5, -6]} text="Mount Everest: 8.8 km" background="#0d2340" opacity={tags} height={1} />
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={3} title="Why Do Planes Fly So High?" subtitle="The secret of cruising altitude 🏔️" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
    </AbsoluteFill>
  );
};
