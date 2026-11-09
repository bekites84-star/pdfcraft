import { random, useCurrentFrame, useVideoConfig } from "remotion";

/** Air density relative to sea level at `km` (standard atmosphere, valid below 11 km). */
export const airDensity = (km: number) => Math.pow(Math.max(0, 1 - 0.0226 * Math.min(11, Math.max(0, km))), 4.256);

/**
 * Air molecules as dots, dense near the ground and sparse higher up.
 * `toY` maps altitude (km) to scene y; dots drift slowly along -x.
 */
export const AirDots: React.FC<{ toY: (km: number) => number; kmRange: [number, number]; xRange: [number, number]; count?: number; z?: number; seed?: string }> = ({
  toY,
  kmRange,
  xRange,
  count = 520,
  z = -2,
  seed = "air",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const w = xRange[1] - xRange[0];
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const km = kmRange[0] + random(`${seed}-h-${i}`) * (kmRange[1] - kmRange[0]);
        if (random(`${seed}-k-${i}`) > airDensity(km)) return null;
        const x0 = random(`${seed}-x-${i}`) * w;
        const x = ((((x0 - t * 0.8) % w) + w) % w) + xRange[0];
        return (
          <mesh key={i} position={[x, toY(km), z]}>
            <sphereGeometry args={[0.07, 8, 6]} />
            <meshStandardMaterial color="#ffffff" emissive="#dcefff" emissiveIntensity={0.7} transparent opacity={0.85} />
          </mesh>
        );
      })}
    </>
  );
};
