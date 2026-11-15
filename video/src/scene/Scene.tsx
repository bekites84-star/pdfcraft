import { ThreeCanvas } from "@remotion/three";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/**
 * A Three.js scene rendered through React Three Fiber.
 * Everything animates from `useCurrentFrame()` (never from clocks or useFrame),
 * so every frame renders deterministically.
 */
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();

  const intro = spring({ frame, fps, config: { damping: 200 } });
  const rotation = frame * 0.02;
  const cameraZ = interpolate(frame, [0, 240], [7, 5], { extrapolateRight: "clamp" });

  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 50, position: [0, 0, cameraZ] }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#6aa8ff" />

      <mesh rotation={[rotation * 0.7, rotation, 0]} scale={intro * 1.6}>
        <torusKnotGeometry args={[1, 0.32, 200, 32]} />
        <meshStandardMaterial color="#ff7a45" metalness={0.4} roughness={0.25} />
      </mesh>

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + frame * 0.03;
        return (
          <mesh key={i} position={[Math.cos(a) * 3, Math.sin(a * 2) * 0.6, Math.sin(a) * 3]} scale={intro * 0.3}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#7cf0c8" flatShading />
          </mesh>
        );
      })}
    </ThreeCanvas>
  );
};
