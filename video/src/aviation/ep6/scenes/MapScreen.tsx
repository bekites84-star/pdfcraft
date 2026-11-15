import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ramp } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";
import { NavDisplay } from "../instruments";

const Legend: React.FC<{ show: number; color: string; label: string }> = ({ show, color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: show, marginTop: 22, fontFamily: "system-ui", fontWeight: 900, fontSize: 38, color: "white" }}>
    <span style={{ width: 40, height: 40, borderRadius: 10, background: color, display: "inline-block" }} />
    {label}
  </div>
);

/** The navigation display, with the route, weather and traffic revealed one by one. */
export const MapScreen: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const route = ramp(frame, wordFrame(scene, "magenta", 0, 40) - 8, wordFrame(scene, "magenta", 0, 40) + 8);
  const wpts = ramp(frame, wordFrame(scene, "waypoints", 0, 80) - 5, wordFrame(scene, "waypoints", 0, 80) + 8);
  const weather = ramp(frame, wordFrame(scene, "weather", 0, 140) - 10, wordFrame(scene, "weather", 0, 140) + 8);
  const traffic = ramp(frame, wordFrame(scene, "planes", 0, 190) - 10, wordFrame(scene, "planes", 0, 190) + 8);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 40% 50%, #1b2230 0%, #0a0d13 80%)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 60 }}>
      <div style={{ borderRadius: 26, padding: 14, background: "#2a2f38", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        <NavDisplay heading={88 + Math.sin(t * 0.4) * 3} t={t} route={Math.max(route, 0.0001) * (0.5 + 0.5 * wpts)} weather={weather} traffic={traffic} width={1020} height={760} />
      </div>
      <div style={{ width: 460 }}>
        <Legend show={route} color="#e040fb" label="Route (magenta)" />
        <Legend show={wpts} color="#b0179b" label="Waypoints" />
        <Legend show={weather} color="#f2d23a" label="Stormy weather" />
        <Legend show={traffic} color="#ffffff" label="Other planes" />
      </div>
    </AbsoluteFill>
  );
};
