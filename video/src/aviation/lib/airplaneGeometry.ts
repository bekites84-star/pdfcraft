import * as THREE from "three";

/**
 * Procedural geometry for a modern twin-engine widebody airliner.
 * Axes: nose along +x, up +y, right wing +z. Built once and shared by every <Airplane>.
 */

type V3 = THREE.Vector3;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));


// ---------------------------------------------------------------- fuselage

export const FUSE_R = 0.45;
const X_NOSE = 3.3;
const X_NOSE_START = 2.0;
const X_TAIL = -3.75;
const X_TAIL_START = -1.9;

/** Centre height, horizontal radius and vertical radius of the fuselage at station x. */
export function fuselageProfile(x: number): { yc: number; r: number; ry: number } {
  if (x > X_NOSE_START) {
    const u = clamp01((x - X_NOSE_START) / (X_NOSE - X_NOSE_START));
    const r = FUSE_R * Math.sqrt(Math.max(0, 1 - Math.pow(u, 2.4)));
    return { yc: -0.1 * u * u, r, ry: r * 1.04 };
  }
  if (x < X_TAIL_START) {
    const u = clamp01((X_TAIL_START - x) / (X_TAIL_START - X_TAIL));
    const r = FUSE_R * (1 - 0.8 * Math.pow(u, 1.4));
    return { yc: 0.27 * Math.pow(u, 1.5), r, ry: r * 1.04 };
  }
  return { yc: 0, r: FUSE_R, ry: FUSE_R * 1.04 };
}

/**
 * A point on the fuselage skin at station x, height parameter vv (-1 bottom .. 1 top) on side ±1,
 * pushed `lift` outward so decals sit just above the skin.
 */
export function fuselagePoint(x: number, vv: number, side: number, lift = 0.004): V3 {
  const { yc, r, ry } = fuselageProfile(x);
  const c = Math.max(-1, Math.min(1, vv));
  return v(x, yc + (ry + lift) * c, side * (r + lift) * Math.sqrt(Math.max(0, 1 - c * c)));
}

/** A patch of skin between stations xs, spanning vv from lo(x) to hi(x), on one side. */
function skinPatch(xs: number[], lo: (x: number) => number, hi: (x: number) => number, side: number, lift: number, across = 8): THREE.BufferGeometry {
  const pos: number[] = [];
  const idx: number[] = [];
  xs.forEach((x) => {
    for (let j = 0; j <= across; j++) {
      const p = fuselagePoint(x, lerp(lo(x), hi(x), j / across), side, lift);
      pos.push(p.x, p.y, p.z);
    }
  });
  const w = across + 1;
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < across; j++) {
      const a = i * w + j;
      idx.push(a, a + 1, a + w + 1, a, a + w + 1, a + w);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const range = (from: number, to: number, n: number) => Array.from({ length: n + 1 }, (_, i) => lerp(from, to, i / n));

/** Swoosh centre line (in vv) and half-width along the body: low under the nose, rising to the tail. */
const swooshT = (x: number) => clamp01((2.75 - x) / 6.45);
const swooshMid = (x: number) => -0.95 + 1.62 * Math.pow(swooshT(x), 2.1);
const swooshHalf = (x: number) => 0.11 + 0.1 * swooshT(x);

function liveryGeometry() {
  const xs = range(2.9, -3.72, 160);
  const blue = (side: number) => skinPatch(xs, (x) => swooshMid(x) - swooshHalf(x), (x) => swooshMid(x) + swooshHalf(x), side, 0.004);
  const skyXs = range(-0.4, -3.72, 80);
  const skyGap = 0.04;
  const skyW = (x: number) => 0.09 * clamp01((-0.4 - x) / 1.4);
  const sky = (side: number) =>
    skinPatch(skyXs, (x) => swooshMid(x) + swooshHalf(x) + skyGap, (x) => swooshMid(x) + swooshHalf(x) + skyGap + skyW(x), side, 0.004, 3);
  // Cockpit windshield panes: (x range, vv range), mirrored on both sides.
  const panes: [number, number, number, number][] = [
    [2.99, 3.105, 0.56, 0.86],
    [2.83, 2.97, 0.5, 0.75],
    [2.7, 2.8, 0.5, 0.68],
  ];
  const glass = [-1, 1].flatMap((side) => panes.map(([x0, x1, v0, v1]) => skinPatch(range(x0, x1, 10), () => v0, () => v1, side, 0.005, 10)));
  return { blue: [blue(1), blue(-1)], sky: [sky(1), sky(-1)], glass };
}

function fuselageGeometry(): THREE.BufferGeometry {
  const radial = 72;
  const xs: number[] = [];
  // Denser stations at the nose and tail where the shape changes.
  for (let i = 0; i <= 40; i++) xs.push(lerp(X_TAIL, X_TAIL_START, i / 40));
  for (let i = 1; i < 30; i++) xs.push(lerp(X_TAIL_START, X_NOSE_START, i / 30));
  for (let i = 0; i <= 50; i++) xs.push(lerp(X_NOSE_START, X_NOSE - 0.002, 1 - Math.pow(1 - i / 50, 1.6)));
  const pos: number[] = [];
  const idx: number[] = [];
  xs.forEach((x) => {
    const { yc, r, ry } = fuselageProfile(x);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      pos.push(x, yc + ry * Math.sin(a), r * Math.cos(a));
    }
  });
  for (let i = 0; i < xs.length - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + ((j + 1) % radial);
      const d = (i + 1) * radial + j;
      idx.push(a, b, c, a, c, d);
    }
  }
  // Caps: tail end and nose tip.
  const capAt = (ring: number, x: number) => {
    const center = pos.length / 3;
    pos.push(x, fuselageProfile(x).yc, 0);
    for (let j = 0; j < radial; j++) idx.push(center, ring * radial + j, ring * radial + ((j + 1) % radial));
  };
  capAt(0, X_TAIL);
  capAt(xs.length - 1, X_NOSE);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------- lofted surfaces

type Section = { le: V3; chord: V3; up: V3; thickness: number };
type Profile = (s: number) => [number, number];

/** Normalised NACA thickness (peak 1 near 30 % chord), slightly cambered. */
const airfoil: Profile = (s) => {
  const t = Math.max(0, (0.2969 * Math.sqrt(s) - 0.126 * s - 0.3516 * s * s + 0.2843 * s ** 3 - 0.1015 * s ** 4) / 0.1004);
  return [0.6 * t, -0.4 * t];
};
/** A thin wedge, thickest at the hinge: for control surfaces. */
const wedge: Profile = (s) => [0.5 * (1 - 0.75 * s), -0.5 * (1 - 0.75 * s)];

/** Lofts airfoil sections into a closed surface; `color` paints vertices by world position. */
function loft(
  coarse: Section[],
  profile: Profile = airfoil,
  color?: (p: V3) => THREE.Color,
  { K = 16, steps = 1 }: { K?: number; steps?: number } = {},
): THREE.BufferGeometry {
  // Optionally insert interpolated sections so vertex colours can follow fine detail.
  const sections: Section[] = [];
  coarse.forEach((sec, i) => {
    const next = coarse[i + 1];
    sections.push(sec);
    if (!next) return;
    for (let k = 1; k < steps; k++) {
      const t = k / steps;
      sections.push({
        le: sec.le.clone().lerp(next.le, t),
        chord: sec.chord.clone().lerp(next.chord, t),
        up: sec.up.clone().lerp(next.up, t).normalize(),
        thickness: lerp(sec.thickness, next.thickness, t),
      });
    }
  });
  const ring: [number, number][] = [];
  for (let k = K; k >= 0; k--) ring.push([(1 - Math.cos((Math.PI * k) / K)) / 2, 1]);
  for (let k = 1; k < K; k++) ring.push([(1 - Math.cos((Math.PI * k) / K)) / 2, -1]);
  const n = ring.length;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const push = (p: V3) => {
    pos.push(p.x, p.y, p.z);
    if (color) {
      const c = color(p);
      col.push(c.r, c.g, c.b);
    }
  };
  const ringPoints = sections.map(({ le, chord, up, thickness }) =>
    ring.map(([s, side]) => {
      const [hi, lo] = profile(s);
      return le.clone().addScaledVector(chord, s).addScaledVector(up, thickness * (side > 0 ? hi : lo));
    }),
  );
  ringPoints.forEach((pts) => pts.forEach(push));
  for (let i = 0; i < sections.length - 1; i++) {
    for (let j = 0; j < n; j++) {
      const a = i * n + j;
      const b = i * n + ((j + 1) % n);
      const c = (i + 1) * n + ((j + 1) % n);
      const d = (i + 1) * n + j;
      idx.push(a, b, c, a, c, d);
    }
  }
  // End caps, with their own vertices so the edges stay crisp.
  for (const pts of [ringPoints[0], ringPoints[ringPoints.length - 1]]) {
    if (!pts) continue;
    const start = pos.length / 3;
    const centre = pts.reduce((acc, p) => acc.add(p), v(0, 0, 0)).multiplyScalar(1 / pts.length);
    pts.forEach(push);
    push(centre);
    for (let j = 0; j < n; j++) idx.push(start + n, start + j, start + ((j + 1) % n));
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  if (color) g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/** Mirror a right-hand part to the left (z → -z). Materials are double-sided, so winding is fine. */
function mirrorZ(g: THREE.BufferGeometry): THREE.BufferGeometry {
  const m = g.clone();
  m.scale(1, 1, -1);
  m.computeVertexNormals();
  return m;
}

// ---------------------------------------------------------------- wing, tail, fin

const WING_ROOT_Z = 0.35;
const WING_TIP_Z = 3.65;
const wingT = (z: number) => clamp01((z - WING_ROOT_Z) / (WING_TIP_Z - WING_ROOT_Z));
export const wingY = (z: number) => -0.27 + (z - WING_ROOT_Z) * 0.105; // 6° dihedral
const wingLE = (z: number) => lerp(1.15, -0.75, wingT(z));
/** Trailing edge of the fixed wing; flaps and ailerons hinge here. */
export const wingTE = (z: number) => lerp(-0.85, -1.35, wingT(z));
const wingThick = (z: number) => lerp(0.2, 0.06, wingT(z));

function wingSection(z: number): Section {
  const le = wingLE(z);
  return { le: v(le, wingY(z), z), chord: v(wingTE(z) - le, 0, 0), up: v(0, 1, 0), thickness: wingThick(z) };
}

function wingGeometry(): THREE.BufferGeometry {
  const tip = wingSection(WING_TIP_Z);
  const winglet = (dz: number, dy: number, le: number, chord: number, angle: number, thickness: number): Section => ({
    le: v(le, tip.le.y + dy, WING_TIP_Z + dz),
    chord: v(-chord, 0, 0),
    up: v(0, Math.cos(angle), -Math.sin(angle)),
    thickness,
  });
  return loft([
    wingSection(0.1),
    wingSection(WING_ROOT_Z),
    wingSection(1.6),
    tip,
    winglet(0.16, 0.1, -0.92, 0.46, 0.8, 0.045),
    winglet(0.25, 0.36, -1.12, 0.34, 1.3, 0.035),
    winglet(0.28, 0.72, -1.4, 0.2, 1.5, 0.02),
  ]);
}

const stabT = (z: number) => clamp01(z / 1.55);
const stabY = (z: number) => 0.2 + z * 0.12;
export const stabTE = (z: number) => lerp(-3.35, -3.53, stabT(z));
function stabGeometry(): THREE.BufferGeometry {
  const sec = (z: number): Section => {
    const le = lerp(-2.5, -3.2, stabT(z));
    return { le: v(le, stabY(z), z), chord: v(stabTE(z) - le, 0, 0), up: v(0, 1, 0), thickness: lerp(0.08, 0.03, stabT(z)) };
  };
  return loft([sec(0.02), sec(1.55)]);
}

/** Tail livery: diagonal bands of constant q = y + 0.85 (x + 2.4), rising toward the back. */
const FIN_BANDS: { q0: number; q1: number; color: "blue" | "sky" }[] = [
  { q0: -9, q1: 0.3, color: "blue" },
  { q0: 0.36, q1: 0.56, color: "sky" },
  { q0: 0.62, q1: 0.86, color: "blue" },
];
const bandX = (q: number, y: number) => (q - y) / 0.85 - 2.4;

const FIN_TE = (y: number) => lerp(-3.28, -3.48, clamp01((y - 0.45) / 1.55));
const FIN_SECTIONS: [number, number, number, number][] = [
  // y, leading edge x, trailing edge x, thickness
  [0.18, -1.45, -3.25, 0.1],
  [0.45, -2.05, FIN_TE(0.45), 0.1],
  [2.0, -3.12, FIN_TE(2.0), 0.04],
];
function finAt(y: number): { le: number; te: number; thick: number } {
  const [a, b] = y < 0.45 ? [FIN_SECTIONS[0], FIN_SECTIONS[1]] : [FIN_SECTIONS[1], FIN_SECTIONS[2]];
  if (!a || !b) return { le: 0, te: 0, thick: 0 };
  const t = clamp01((y - a[0]) / (b[0] - a[0]));
  return { le: lerp(a[1], b[1], t), te: lerp(a[2], b[2], t), thick: lerp(a[3], b[3], t) };
}

function finGeometry(): THREE.BufferGeometry {
  return loft(FIN_SECTIONS.map(([y, le, te, thickness]) => ({ le: v(le, y, 0), chord: v(te - le, 0, 0), up: v(0, 0, 1), thickness })));
}

/**
 * Stripe decals on a vertical surface. For each height y the surface spans x in [te, le] and its
 * skin sits at z = halfZ(y, x, side); each band is clipped to that span row by row.
 */
function stripeDecals(
  ys: number[],
  span: (y: number) => [number, number],
  halfZ: (y: number, x: number, side: number) => number,
): Record<"blue" | "sky", THREE.BufferGeometry[]> {
  const out: Record<"blue" | "sky", THREE.BufferGeometry[]> = { blue: [], sky: [] };
  const across = 10;
  for (const band of FIN_BANDS) {
    for (const side of [1, -1]) {
      const pos: number[] = [];
      const idx: number[] = [];
      ys.forEach((y) => {
        const [te, le] = span(y);
        const x0 = Math.min(le, Math.max(te, bandX(band.q0, y)));
        const x1 = Math.min(le, Math.max(te, bandX(band.q1, y)));
        for (let j = 0; j <= across; j++) {
          const x = lerp(x0, x1, j / across);
          pos.push(x, y, halfZ(y, x, side) + side * 0.003);
        }
      });
      const w = across + 1;
      for (let i = 0; i < ys.length - 1; i++) {
        for (let j = 0; j < across; j++) {
          const a = i * w + j;
          idx.push(a, a + 1, a + w + 1, a, a + w + 1, a + w);
        }
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      out[band.color].push(g);
    }
  }
  return out;
}

function finStripes() {
  return stripeDecals(
    range(0.3, 2.0, 90),
    (y) => {
      const f = finAt(y);
      return [f.te, f.le];
    },
    (y, x, side) => {
      const f = finAt(y);
      const [hi, lo] = airfoil(clamp01((f.le - x) / (f.le - f.te)));
      return f.thick * (side > 0 ? hi : lo);
    },
  );
}

// ---------------------------------------------------------------- hinged control surfaces

export type Hinged = {
  geometry: THREE.BufferGeometry;
  mid: V3;
  quat: THREE.Quaternion;
  /** Decals that move with the part, in its hinge frame. */
  decals?: Record<"blue" | "sky", THREE.BufferGeometry[]>;
};

/** Expresses a geometry built in airplane coordinates in a part's hinge frame. */
function toHingeFrame(world: THREE.BufferGeometry, h: Pick<Hinged, "mid" | "quat">): THREE.BufferGeometry {
  const local = world.clone();
  local.translate(-h.mid.x, -h.mid.y, -h.mid.z);
  local.applyQuaternion(h.quat.clone().invert());
  local.computeVertexNormals();
  return local;
}

/**
 * Re-expresses a part built in airplane coordinates in a hinge frame whose local z is the
 * hinge line (p1 → p2) and local y follows `ref`, so rotating about local z deflects it.
 */
function hinge(world: THREE.BufferGeometry, p1: V3, p2: V3, ref: V3): Hinged {
  const z = p2.clone().sub(p1).normalize();
  const y = ref.clone().addScaledVector(z, -ref.dot(z)).normalize();
  const x = y.clone().cross(z);
  const quat = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  const mid = p1.clone().add(p2).multiplyScalar(0.5);
  return { geometry: toHingeFrame(world, { mid, quat }), mid, quat };
}

/** Left-side twin of a right-side part: mirrored geometry, hinge axis still pointing toward +z. */
const mirrorHinged = (world: THREE.BufferGeometry, p1: V3, p2: V3, ref: V3): Hinged => {
  const m = (p: V3) => v(p.x, p.y, -p.z);
  return hinge(mirrorZ(world), m(p2), m(p1), ref);
};

/** A wing-trailing-edge strip (flap / aileron / elevator) between spans z1..z2. */
function trailingStrip(teAt: (z: number) => number, yAt: (z: number) => number, z1: number, z2: number, chord: number, thickness: number) {
  const p1 = v(teAt(z1), yAt(z1), z1);
  const p2 = v(teAt(z2), yAt(z2), z2);
  const world = loft(
    [
      { le: p1, chord: v(-chord, 0, 0), up: v(0, 1, 0), thickness },
      { le: p2, chord: v(-chord * 0.9, 0, 0), up: v(0, 1, 0), thickness: thickness * 0.8 },
    ],
    wedge,
  );
  const up = v(0, 1, 0);
  const right = hinge(world, p1, p2, up);
  return { right, left: mirrorHinged(world, p1, p2, up) };
}

/** A spoiler panel lying on the wing's upper surface, hinged at its front edge. */
function spoilerPanel(z1: number, z2: number) {
  const at = (z: number) => {
    const xh = wingTE(z) + 0.46;
    const s = clamp01((wingLE(z) - xh) / (wingLE(z) - wingTE(z)));
    const [hi] = airfoil(s);
    return v(xh, wingY(z) + wingThick(z) * hi + 0.004, z);
  };
  const p1 = at(z1);
  const p2 = at(z2);
  const world = loft(
    [
      { le: p1, chord: v(-0.42, -0.03, 0), up: v(0, 1, 0), thickness: 0.018 },
      { le: p2, chord: v(-0.4, -0.03, 0), up: v(0, 1, 0), thickness: 0.018 },
    ],
    wedge,
  );
  const up = v(0, 1, 0);
  const right = hinge(world, p1, p2, up);
  return { right, left: mirrorHinged(world, p1, p2, up) };
}

function rudderPart(): Hinged {
  const y1 = 0.45;
  const y2 = 1.98;
  const p1 = v(FIN_TE(y1), y1, 0);
  const p2 = v(FIN_TE(y2), y2, 0);
  const chordAt = (y: number) => lerp(0.27, 0.24, clamp01((y - y1) / (y2 - y1)));
  const thickAt = (y: number) => lerp(0.045, 0.03, clamp01((y - y1) / (y2 - y1)));
  const world = loft(
    [
      { le: p1, chord: v(-chordAt(y1), 0, 0), up: v(0, 0, 1), thickness: thickAt(y1) },
      { le: p2, chord: v(-chordAt(y2), 0, 0), up: v(0, 0, 1), thickness: thickAt(y2) },
    ],
    wedge,
  );
  const h = hinge(world, p1, p2, v(0, 0, 1));
  const stripes = stripeDecals(
    range(y1, y2, 80),
    (y) => [FIN_TE(y) - chordAt(y), FIN_TE(y)],
    (y, x, side) => {
      const [hi, lo] = wedge(clamp01((FIN_TE(y) - x) / chordAt(y)));
      return thickAt(y) * (side > 0 ? hi : lo);
    },
  );
  return {
    ...h,
    decals: { blue: stripes.blue.map((g) => toHingeFrame(g, h)), sky: stripes.sky.map((g) => toHingeFrame(g, h)) },
  };
}

// ---------------------------------------------------------------- engine nacelle

/** Nacelle skin as a lathe around the engine axis (+x), with a rounded intake lip. */
function nacelleGeometry(): THREE.BufferGeometry {
  const pts = [
    [0.27, 0.3],
    [0.285, 0.55],
    [0.3, 0.64],
    [0.322, 0.672],
    [0.345, 0.668],
    [0.362, 0.64],
    [0.374, 0.52],
    [0.376, 0.25],
    [0.365, -0.05],
    [0.335, -0.32],
    [0.29, -0.52],
    [0.27, -0.53],
    [0.255, -0.45],
  ].map(([r, a]) => new THREE.Vector2(r, a));
  const g = new THREE.LatheGeometry(pts, 56);
  g.rotateZ(-Math.PI / 2); // lathe axis y → +x
  return g;
}

// ---------------------------------------------------------------- shared cache

export type AirplaneGeometry = ReturnType<typeof build>;

function build() {
  const wing = wingGeometry();
  const stab = stabGeometry();
  return {
    fuselage: fuselageGeometry(),
    livery: liveryGeometry(),
    wingR: wing,
    wingL: mirrorZ(wing),
    stabR: stab,
    stabL: mirrorZ(stab),
    fin: finGeometry(),
    finStripes: finStripes(),
    nacelle: nacelleGeometry(),
    flap: trailingStrip(wingTE, wingY, 0.45, 2.2, 0.3, 0.045),
    aileron: trailingStrip(wingTE, wingY, 2.28, 3.55, 0.27, 0.035),
    elevator: trailingStrip(stabTE, stabY, 0.24, 1.5, 0.22, 0.03),
    spoilers: [spoilerPanel(0.62, 1.3), spoilerPanel(1.42, 2.12)],
    rudder: rudderPart(),
  };
}

let cache: AirplaneGeometry | null = null;
export function airplaneGeometry(): AirplaneGeometry {
  if (!cache) cache = build();
  return cache;
}
