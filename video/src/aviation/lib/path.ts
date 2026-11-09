import * as THREE from "three";

export type Pose = {
  position: [number, number, number];
  /** Rotation about y that turns the plane's nose (+x) onto the path direction. */
  yaw: number;
  /** Roll into the turn (radians, about the plane's own x axis). */
  bank: number;
  tangent: THREE.Vector3;
};

const heading = (t: THREE.Vector3) => Math.atan2(-t.z, t.x);

/** Where a plane following `curve` is at u (0..1), facing along it and banking into turns. */
export function followCurve(curve: THREE.Curve<THREE.Vector3>, u: number, bankGain = 18, maxBank = 0.5): Pose {
  const k = Math.min(1, Math.max(0, u));
  const p = curve.getPointAt(k);
  const t = curve.getTangentAt(k);
  const du = 0.01;
  const a = heading(curve.getTangentAt(Math.max(0, k - du)));
  const b = heading(curve.getTangentAt(Math.min(1, k + du)));
  let turn = b - a;
  if (turn > Math.PI) turn -= Math.PI * 2;
  if (turn < -Math.PI) turn += Math.PI * 2;
  // Turning left (heading increasing) banks left: left wing (-z) down = negative roll about x.
  const bank = Math.max(-maxBank, Math.min(maxBank, -turn * bankGain * (du * 50)));
  return { position: [p.x, p.y, p.z], yaw: heading(t), bank, tangent: t };
}

/** A smooth curve through points [x, y, z]. */
export const smoothPath = (pts: [number, number, number][]) => new THREE.CatmullRomCurve3(pts.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "centripetal");
