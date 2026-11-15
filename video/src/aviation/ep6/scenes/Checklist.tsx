import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage } from "../../lib/common";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { Cockpit } from "../cockpit";

const ITEMS = ["Doors closed", "Seat belt sign ON", "Flaps set", "Lights ON", "Ready for takeoff!"];

/** A clipboard checklist, ticked off item by item. */
export const Checklist: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const from = wordFrame(scene, "checklists", 0, 50) - 10;
  const to = Math.max(from + 40, wordFrame(scene, "forgotten", 0, 110) + 10);
  const done = interpolate(frame, [from, to], [0, ITEMS.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [-2.5, 2.0, 0], fov: 50 }} lookAt={[0.8, 1.0, 0]}>
        <Cockpit pilots />
      </Stage>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 760, background: "#fffdf5", borderRadius: 26, padding: "34px 44px 40px", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", fontFamily: "system-ui", borderTop: "26px solid #8a6a3a" }}>
          <div style={{ fontSize: 34, fontWeight: 900, color: "#51607a", letterSpacing: 3 }}>BEFORE TAKEOFF</div>
          {ITEMS.map((item, i) => {
            const k = Math.min(1, Math.max(0, done - i));
            return (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 20, fontSize: 46, fontWeight: 800, color: k > 0.5 ? "#0d2340" : "#9aa3b1" }}>
                <span style={{ width: 56, height: 56, borderRadius: 14, border: "4px solid #22b35e", background: k > 0.5 ? "#22b35e" : "transparent", color: "white", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 38, transform: `scale(${1 + 0.25 * Math.sin(k * Math.PI)})` }}>
                  {k > 0.5 ? "✓" : ""}
                </span>
                {item}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
