import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "./Airplane";
import { Stage } from "./common";

/** Studio view of the airplane model, slowly turning, gear down. */
export const Turntable: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const a = -0.7 + (frame / durationInFrames) * Math.PI * 2;
  return (
    <AbsoluteFill>
      <Stage background="radial-gradient(circle at 50% 40%, #5a5d63 0%, #3b3e43 70%)" camera={{ position: [Math.cos(a) * 11, 1.6, Math.sin(a) * 11], fov: 40 }} lookAt={[0, -0.1, 0]}>
        <Airplane gear={1} fan={(frame / fps) * 6} />
        <mesh position={[0, -0.935, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[9, 64]} />
          <meshStandardMaterial color="#45484e" roughness={1} />
        </mesh>
      </Stage>
    </AbsoluteFill>
  );
};
