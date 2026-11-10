import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import * as THREE from "three";
import { Arrow, FORCE_COLORS, Label3D, Stage, useGrow } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const CHORD = 4.4;
const ROWS = [-2.9, -2.05, -1.25, 1.2, 2.0, 2.85];
const PER_ROW = 16;
const SPAN_X = 20;

/** Cambered airfoil outline (NACA 4-digit formula), leading edge at x = -CHORD/2. */
function airfoilShape(): THREE.Shape {
  const m = 0.06, p = 0.4, th = 0.15, n = 40;
  const upper: THREE.Vector2[] = [];
  const lower: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos((i / n) * Math.PI)) / 2;
    const yt = 5 * th * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x ** 2 + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    const yc = x < p ? (m / p ** 2) * (2 * p * x - x ** 2) : (m / (1 - p) ** 2) * (1 - 2 * p + 2 * p * x - x ** 2);
    upper.push(new THREE.Vector2((x - 0.5) * CHORD, (yc + yt) * CHORD));
    lower.push(new THREE.Vector2((x - 0.5) * CHORD, (yc - yt) * CHORD));
  }
  return new THREE.Shape([...upper, ...lower.reverse().slice(1)]);
}

const smooth = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return k * k * (3 - 2 * k);
};

/** Streamline height at x for a row starting at y0; `turn` scales how much the wing bends the air. */
function flowY(x: number, y0: number, turn: number): number {
  const k = Math.exp(-(Math.abs(y0) - 1.2) / 2.2);
  const over = y0 > 0 ? 0.55 * Math.exp(-((x + 0.2) ** 2) / 3) : -0.12 * Math.exp(-((x + 0.2) ** 2) / 3);
  const upwash = 0.25 * Math.exp(-((x + 3.2) ** 2) / 2);
  const downwash = -1.25 * smooth(-0.5, 5, x);
  return y0 + k * (over + turn * (upwash + downwash));
}

export const Lift: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(airfoilShape(), { depth: 2.2, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2 });
    g.translate(0, 0, -1.1);
    return g;
  }, []);

  const tiltAt = wordFrame(scene, "tilted", 0, 60);
  const tilt = interpolate(frame, [tiltAt, tiltAt + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const turn = 0.25 + 0.75 * tilt;
  const down = useGrow(wordFrame(scene, "downward", 0, 150));
  const up = useGrow(wordFrame(scene, "up", 0, 300));
  const shape = useGrow(wordFrame(scene, "curved", 0, 40));

  const lines = ROWS.map((y0) => Array.from({ length: 60 }, (_, i) => {
    const x = -SPAN_X / 2 + (i / 59) * SPAN_X;
    return [x, flowY(x, y0, turn), -1.2] as [number, number, number];
  }));

  return (
    <Stage camera={{ position: [0, 0.2, 14] }} lookAt={[0, -0.2, 0]}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#ffffff" lineWidth={2} transparent opacity={0.35} />
      ))}
      {ROWS.flatMap((y0, r) =>
        Array.from({ length: PER_ROW }, (_, i) => {
          const speed = y0 > 0 ? 4.2 : 3.4; // air over the top moves faster
          const x = ((((i / PER_ROW) * SPAN_X + t * speed + r * 0.7) % SPAN_X) + SPAN_X) % SPAN_X - SPAN_X / 2;
          return (
            <mesh key={`${r}-${i}`} position={[x, flowY(x, y0, turn), -1.2]} scale={[2.6, 1, 1]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#cfe6ff" emissiveIntensity={0.8} />
            </mesh>
          );
        }),
      )}
      <group rotation={[0, 0, -0.16 * tilt]} position={[0, 0, 0]}>
        <mesh geometry={geometry} rotation={[0.1, -0.12, 0]}>
          <meshStandardMaterial color="#2c5a9e" metalness={0.3} roughness={0.35} />
        </mesh>
        <Label3D position={[0, -1.25, 0]} text="A wing, seen from the side" background="#0d2340" opacity={shape} height={0.55} />
      </group>
      <Arrow origin={[4.6, -0.4, 0]} dir={[0, -1, 0]} length={2.1} color={FORCE_COLORS.thrust} progress={down} label="air pushed DOWN" labelOffset={[0.4, -0.6, 0]} />
      <Arrow origin={[-0.3, 0.75, 0.6]} dir={[0, 1, 0]} length={2.2} color={FORCE_COLORS.lift} progress={up} label="LIFT ↑" labelOffset={[0, 0.6, 0]} thickness={0.16} />
    </Stage>
  );
};
