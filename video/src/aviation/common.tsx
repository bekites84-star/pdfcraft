import { Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { useLayoutEffect } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const SKY = "linear-gradient(180deg, #3b8fe0 0%, #7fbcf2 55%, #d6ecff 100%)";
export const SUNSET = "linear-gradient(180deg, #2b2d6e 0%, #b0508a 45%, #ff9a5a 80%, #ffd27a 100%)";

/** Full-frame 3D stage on top of a CSS sky gradient. */
export const Stage: React.FC<{
  background?: string;
  camera: { position: [number, number, number]; fov?: number };
  lookAt?: [number, number, number];
  children: React.ReactNode;
}> = ({ background = SKY, camera, lookAt = [0, 0, 0], children }) => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: camera.position, fov: camera.fov ?? 40 }}
        onCreated={({ camera: c }) => c.lookAt(...lookAt)}
      >
        <CameraRig position={camera.position} lookAt={lookAt} />
        <hemisphereLight args={["#ffffff", "#7a8fa8", 1.2]} />
        <directionalLight position={[6, 10, 8]} intensity={2.2} />
        <directionalLight position={[-6, 2, -6]} intensity={0.5} color="#bcd6ff" />
        {children}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Moves the camera every frame (props come from the current Remotion frame). */
const CameraRig: React.FC<{ position: [number, number, number]; lookAt: [number, number, number] }> = ({ position, lookAt }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    camera.position.set(...position);
    camera.lookAt(...lookAt);
    camera.updateProjectionMatrix();
  }, [camera, position[0], position[1], position[2], lookAt[0], lookAt[1], lookAt[2]]);
  return null;
};

/** A fluffy cloud made of spheres. Deterministic per seed. */
export const Cloud: React.FC<{ seed: number; position: [number, number, number]; scale?: number; opacity?: number }> = ({
  seed,
  position,
  scale = 1,
  opacity = 1,
}) => {
  const puffs = Array.from({ length: 7 }, (_, i) => {
    const r = 0.6 + random(`${seed}-r-${i}`) * 0.7;
    const x = (i - 3) * 0.75 + (random(`${seed}-x-${i}`) - 0.5) * 0.4;
    const y = (random(`${seed}-y-${i}`) - 0.3) * 0.5 + (r - 0.6) * 0.5;
    const z = (random(`${seed}-z-${i}`) - 0.5) * 0.8;
    return { r, x, y, z };
  });
  return (
    <group position={position} scale={scale}>
      {puffs.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <sphereGeometry args={[p.r, 20, 14]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.35} roughness={1} transparent={opacity < 1} opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
};

/** A field of clouds drifting along -x at `speed` units per second, wrapping around. */
export const CloudField: React.FC<{ speed?: number; count?: number; spread?: number; y?: [number, number]; z?: [number, number]; seed?: string }> = ({
  speed = 0.5,
  count = 10,
  spread = 60,
  y = [-4, 5],
  z = [-30, -8],
  seed = "clouds",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const x0 = random(`${seed}-x-${i}`) * spread;
        const x = ((((x0 - t * speed) % spread) + spread) % spread) - spread / 2;
        const cy = y[0] + random(`${seed}-y-${i}`) * (y[1] - y[0]);
        const cz = z[0] + random(`${seed}-z-${i}`) * (z[1] - z[0]);
        return <Cloud key={i} seed={i} position={[x, cy, cz]} scale={1 + random(`${seed}-s-${i}`) * 1.2} />;
      })}
    </>
  );
};

/** A 3D arrow from `origin` along a unit `dir`, growing in with `progress` (0..1), with a label. */
export const Arrow: React.FC<{
  origin: [number, number, number];
  dir: [number, number, number];
  length: number;
  color: string;
  progress: number;
  label?: string;
  labelOffset?: [number, number, number];
  thickness?: number;
}> = ({ origin, dir, length, color, progress, label, labelOffset = [0, 0, 0], thickness = 0.12 }) => {
  if (progress <= 0.001) return null;
  const len = Math.max(0.01, length * progress);
  const head = Math.min(len * 0.45, thickness * 4);
  const shaft = Math.max(0.001, len - head);
  // Rotate the +y axis onto dir.
  const [dx, dy, dz] = dir;
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, dy, dz).normalize());
  const tip: [number, number, number] = [origin[0] + dx * len, origin[1] + dy * len, origin[2] + dz * len];
  return (
    <group>
      <group position={origin} quaternion={quat}>
        <mesh position={[0, shaft / 2, 0]}>
          <cylinderGeometry args={[thickness, thickness, shaft, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </mesh>
        <mesh position={[0, shaft + head / 2, 0]}>
          <coneGeometry args={[thickness * 2.4, head, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} />
        </mesh>
      </group>
      {label ? (
        <Html position={[tip[0] + labelOffset[0], tip[1] + labelOffset[1], tip[2] + labelOffset[2]]} center zIndexRange={[10, 0]}>
          <div style={{ ...labelStyle, background: color, opacity: Math.min(1, progress * 1.5) }}>{label}</div>
        </Html>
      ) : null}
    </group>
  );
};

export const labelStyle: React.CSSProperties = {
  fontFamily: "system-ui, sans-serif",
  fontWeight: 800,
  fontSize: 44,
  color: "white",
  padding: "8px 22px",
  borderRadius: 14,
  whiteSpace: "nowrap",
  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
  letterSpacing: 1,
};

/** Spring that starts at frame `at`. */
export function useGrow(at: number, damping = 14): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - at, fps, config: { damping } });
}

/** Scene title chip in the top-left corner. */
export const TitleChip: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [4, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(frame, [4, 16], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ padding: 56, pointerEvents: "none" }}>
      <div
        style={{
          alignSelf: "flex-start",
          transform: `translateX(${x}px)`,
          opacity,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 46,
          color: "#0d2340",
          background: "rgba(255,255,255,0.88)",
          padding: "12px 30px",
          borderRadius: 18,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        {title}
      </div>
    </AbsoluteFill>
  );
};
