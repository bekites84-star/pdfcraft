/** Primary flight instruments drawn as SVG, sized for a 1920×1080 frame. */

const MONO = "ui-monospace, 'DejaVu Sans Mono', monospace";
const range = (from: number, to: number, step: number) => {
  const out: number[] = [];
  for (let v = Math.ceil(from / step) * step; v <= to; v += step) out.push(v);
  return out;
};

/** Vertical speed tape. Red below `vmin` (too slow), red-and-black above `vmax` (too fast). */
export const SpeedTape: React.FC<{ kts: number; vmin?: number; vmax?: number; height?: number }> = ({ kts, vmin = 140, vmax = 330, height = 640 }) => {
  const W = 190;
  const cy = height / 2;
  const px = 3; // pixels per knot
  const y = (v: number) => cy - (v - kts) * px;
  return (
    <svg width={W + 20} height={height} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="spd">
          <rect x={0} y={0} width={W} height={height} rx={14} />
        </clipPath>
        <pattern id="barber" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="12" height="24" fill="#e5484d" />
          <rect x="12" width="12" height="24" fill="#111" />
        </pattern>
      </defs>
      <g clipPath="url(#spd)">
        <rect width={W} height={height} fill="#3b4350" />
        <rect x={W - 26} y={y(vmin)} width={26} height={Math.max(0, height - y(vmin))} fill="#e5484d" />
        <rect x={W - 26} y={0} width={26} height={Math.max(0, y(vmax))} fill="url(#barber)" />
        {range(kts - 120, kts + 120, 10).map((v) => (
          <g key={v}>
            <line x1={W - 56} x2={W - 30} y1={y(v)} y2={y(v)} stroke="#fff" strokeWidth={3} />
            {v % 20 === 0 ? (
              <text x={W - 66} y={y(v) + 11} textAnchor="end" fill="#fff" fontSize={32} fontFamily={MONO} fontWeight={700}>
                {v}
              </text>
            ) : null}
          </g>
        ))}
      </g>
      <polygon points={`0,${cy - 34} ${W - 34},${cy - 34} ${W - 10},${cy} ${W - 34},${cy + 34} 0,${cy + 34}`} fill="#000" stroke="#ffd23f" strokeWidth={4} />
      <text x={(W - 34) / 2} y={cy + 15} textAnchor="middle" fill="#fff" fontSize={44} fontFamily={MONO} fontWeight={800}>
        {Math.round(kts)}
      </text>
      <text x={W / 2} y={-14} textAnchor="middle" fill="#fff" fontSize={28} fontFamily="system-ui" fontWeight={800}>
        SPEED (knots)
      </text>
    </svg>
  );
};

/** Attitude indicator: blue sky over brown ground, moving with pitch and bank (degrees). */
export const AttitudeIndicator: React.FC<{ pitch: number; roll: number; size?: number }> = ({ pitch, roll, size = 520 }) => {
  const c = size / 2;
  const r = size / 2 - 10;
  const k = 7; // pixels per degree of pitch
  return (
    <svg width={size} height={size}>
      <defs>
        <clipPath id="adi">
          <circle cx={c} cy={c} r={r} />
        </clipPath>
      </defs>
      <g clipPath="url(#adi)">
        <g transform={`rotate(${-roll} ${c} ${c}) translate(0 ${pitch * k})`}>
          <rect x={-size} y={-size * 2 + c} width={size * 3} height={size * 2} fill="#2f7fd6" />
          <rect x={-size} y={c} width={size * 3} height={size * 2} fill="#8a5a2b" />
          <line x1={-size} x2={size * 2} y1={c} y2={c} stroke="#fff" strokeWidth={4} />
          {[-20, -10, 10, 20].map((d) => (
            <g key={d}>
              <line x1={c - (Math.abs(d) === 10 ? 50 : 80)} x2={c + (Math.abs(d) === 10 ? 50 : 80)} y1={c - d * k} y2={c - d * k} stroke="#fff" strokeWidth={3} />
              <text x={c + 95} y={c - d * k + 10} fill="#fff" fontSize={26} fontFamily={MONO} fontWeight={700}>
                {Math.abs(d)}
              </text>
            </g>
          ))}
        </g>
      </g>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#1a1f27" strokeWidth={14} />
      {/* Bank scale and pointer */}
      {[-60, -45, -30, -20, -10, 0, 10, 20, 30, 45, 60].map((a) => {
        const rad = ((a - 90) * Math.PI) / 180;
        const r1 = r - 8;
        const r2 = r - (a % 30 === 0 ? 34 : 22);
        return <line key={a} x1={c + Math.cos(rad) * r1} y1={c + Math.sin(rad) * r1} x2={c + Math.cos(rad) * r2} y2={c + Math.sin(rad) * r2} stroke="#fff" strokeWidth={3} />;
      })}
      <g transform={`rotate(${-roll} ${c} ${c})`}>
        <polygon points={`${c},${c - r + 40} ${c - 14},${c - r + 64} ${c + 14},${c - r + 64}`} fill="#fff" />
      </g>
      {/* Fixed yellow airplane symbol */}
      <rect x={c - 150} y={c - 7} width={95} height={14} fill="#ffd23f" stroke="#000" strokeWidth={2} />
      <rect x={c + 55} y={c - 7} width={95} height={14} fill="#ffd23f" stroke="#000" strokeWidth={2} />
      <rect x={c - 9} y={c - 9} width={18} height={18} fill="#ffd23f" stroke="#000" strokeWidth={2} />
    </svg>
  );
};

/** Altitude tape (feet) with a vertical-speed arrow (feet per minute). */
export const AltitudeTape: React.FC<{ ft: number; fpm: number; height?: number }> = ({ ft, fpm, height = 640 }) => {
  const W = 210;
  const cy = height / 2;
  const px = 0.45; // pixels per foot
  const y = (v: number) => cy - (v - ft) * px;
  const vsY = cy - Math.max(-1, Math.min(1, fpm / 3000)) * (height / 2 - 40);
  return (
    <svg width={W + 140} height={height} style={{ overflow: "visible" }}>
      <defs>
        <clipPath id="alt">
          <rect x={0} y={0} width={W} height={height} rx={14} />
        </clipPath>
      </defs>
      <g clipPath="url(#alt)">
        <rect width={W} height={height} fill="#3b4350" />
        {range(ft - 800, ft + 800, 100).map((v) => (
          <g key={v}>
            <line x1={0} x2={v % 500 === 0 ? 34 : 20} y1={y(v)} y2={y(v)} stroke="#fff" strokeWidth={3} />
            {v % 200 === 0 ? (
              <text x={46} y={y(v) + 11} fill="#fff" fontSize={30} fontFamily={MONO} fontWeight={700}>
                {v}
              </text>
            ) : null}
          </g>
        ))}
      </g>
      <polygon points={`${W},${cy - 34} 34,${cy - 34} 10,${cy} 34,${cy + 34} ${W},${cy + 34}`} fill="#000" stroke="#ffd23f" strokeWidth={4} />
      <text x={(W + 34) / 2} y={cy + 15} textAnchor="middle" fill="#fff" fontSize={40} fontFamily={MONO} fontWeight={800}>
        {Math.round(ft / 10) * 10}
      </text>
      {/* Vertical speed: an arrow beside the tape */}
      <rect x={W + 30} y={30} width={50} height={height - 60} rx={12} fill="#2b313b" />
      <line x1={W + 30} x2={W + 80} y1={cy} y2={cy} stroke="#9aa3b1" strokeWidth={3} />
      <line x1={W + 55} x2={W + 55} y1={cy} y2={vsY} stroke="#3fdf6a" strokeWidth={8} strokeLinecap="round" />
      <polygon
        points={fpm >= 0 ? `${W + 55},${vsY - 22} ${W + 39},${vsY} ${W + 71},${vsY}` : `${W + 55},${vsY + 22} ${W + 39},${vsY} ${W + 71},${vsY}`}
        fill="#3fdf6a"
      />
      <text x={W + 92} y={vsY + 10} fill="#3fdf6a" fontSize={28} fontFamily={MONO} fontWeight={800}>
        {fpm >= 0 ? "+" : "−"}
        {Math.abs(Math.round(fpm / 100) * 100)}
      </text>
      <text x={W / 2 + 40} y={-14} textAnchor="middle" fill="#fff" fontSize={28} fontFamily="system-ui" fontWeight={800}>
        HEIGHT (feet)
      </text>
    </svg>
  );
};

/** Moving-map (navigation) display: compass arc, magenta route, weather and nearby traffic. */
export const NavDisplay: React.FC<{ heading: number; t: number; route: number; weather: number; traffic: number; width?: number; height?: number }> = ({
  heading,
  t,
  route,
  weather,
  traffic,
  width = 1100,
  height = 820,
}) => {
  const ax = width / 2;
  const ay = height - 90;
  const R = 600;
  const pt = (bearing: number, dist: number) => {
    const a = ((bearing - heading) * Math.PI) / 180;
    return [ax + Math.sin(a) * dist, ay - Math.cos(a) * dist] as const;
  };
  const wpts: { name: string; b: number; d: number }[] = [
    { name: "RIVER", b: 95, d: 220 },
    { name: "PEAKS", b: 72, d: 430 },
    { name: "CLOUD", b: 104, d: 640 },
  ];
  const routePts = [[ax, ay] as const, ...wpts.map((w) => pt(w.b, w.d))];
  return (
    <svg width={width} height={height}>
      <defs>
        <clipPath id="nd">
          <rect width={width} height={height} rx={20} />
        </clipPath>
        <radialGradient id="wx">
          <stop offset="0%" stopColor="#e5484d" />
          <stop offset="35%" stopColor="#f2d23a" />
          <stop offset="75%" stopColor="#3fbf5a" />
          <stop offset="100%" stopColor="#3fbf5a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <g clipPath="url(#nd)">
        <rect width={width} height={height} fill="#04070c" />
        <g opacity={weather}>
          <ellipse cx={pt(55, 360)[0]} cy={pt(55, 360)[1]} rx={130} ry={80} fill="url(#wx)" transform={`rotate(-20 ${pt(55, 360)[0]} ${pt(55, 360)[1]})`} />
          <ellipse cx={pt(125, 520)[0]} cy={pt(125, 520)[1]} rx={90} ry={60} fill="url(#wx)" />
        </g>
        {[200, 400].map((r) => (
          <path key={r} d={`M ${ax - r * 0.77} ${ay - r * 0.64} A ${r} ${r} 0 0 1 ${ax + r * 0.77} ${ay - r * 0.64}`} fill="none" stroke="#9aa3b1" strokeWidth={2} strokeDasharray="10 10" />
        ))}
        {/* Compass arc */}
        <path d={`M ${ax - R * 0.77} ${ay - R * 0.64} A ${R} ${R} 0 0 1 ${ax + R * 0.77} ${ay - R * 0.64}`} fill="none" stroke="#fff" strokeWidth={4} />
        {range(heading - 50, heading + 50, 5).map((b) => {
          const [x1, y1] = pt(b, R);
          const [x2, y2] = pt(b, R - (b % 10 === 0 ? 28 : 16));
          const [tx, ty] = pt(b, R - 58);
          const label = ((Math.round(b) % 360) + 360) % 360;
          return (
            <g key={b}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeWidth={3} />
              {b % 30 === 0 ? (
                <text x={tx} y={ty + 10} textAnchor="middle" fill="#fff" fontSize={32} fontFamily={MONO} fontWeight={700}>
                  {String(label / 10).padStart(2, "0")}
                </text>
              ) : null}
            </g>
          );
        })}
        <g opacity={route}>
          <polyline points={routePts.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke="#e040fb" strokeWidth={6} />
          {wpts.map((w) => {
            const [x, y] = pt(w.b, w.d);
            return (
              <g key={w.name}>
                <polygon points={`${x},${y - 16} ${x + 6},${y - 6} ${x + 16},${y} ${x + 6},${y + 6} ${x},${y + 16} ${x - 6},${y + 6} ${x - 16},${y} ${x - 6},${y - 6}`} fill="#e040fb" />
                <text x={x + 24} y={y + 10} fill="#e040fb" fontSize={30} fontFamily={MONO} fontWeight={800}>
                  {w.name}
                </text>
              </g>
            );
          })}
        </g>
        <g opacity={traffic}>
          {[
            { b: 40 + t * 2, d: 300, tag: "+10 ↓" },
            { b: 150 - t * 1.5, d: 380, tag: "−20" },
          ].map((p, i) => {
            const [x, y] = pt(p.b, p.d);
            return (
              <g key={i}>
                <polygon points={`${x},${y - 16} ${x + 14},${y} ${x},${y + 16} ${x - 14},${y}`} fill="#ffffff" />
                <text x={x - 30} y={y - 26} fill="#ffffff" fontSize={26} fontFamily={MONO} fontWeight={700}>
                  {p.tag}
                </text>
              </g>
            );
          })}
        </g>
        {/* Own aircraft */}
        <polygon points={`${ax},${ay - 26} ${ax - 18},${ay + 20} ${ax + 18},${ay + 20}`} fill="#ffd23f" />
        <rect x={ax - 70} y={18} width={140} height={56} rx={8} fill="#000" stroke="#fff" strokeWidth={3} />
        <text x={ax} y={60} textAnchor="middle" fill="#fff" fontSize={38} fontFamily={MONO} fontWeight={800}>
          {String(Math.round(((heading % 360) + 360) % 360)).padStart(3, "0")}°
        </text>
      </g>
    </svg>
  );
};
