import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Airplane } from "../../lib/Airplane";
import { CloudField, Stage, useGrow } from "../../lib/common";
import { IntroTitle } from "../../lib/props";
import { wordFrame, type SceneTimeline } from "../../lib/timeline";

const WORDS: [string, string][] = [
  ["suck", "#2f7cf6"],
  ["squeeze", "#22b35e"],
  ["bang", "#f08a24"],
  ["blow", "#e5484d"],
];

/** Close on the airliner's engine; the four magic words pop up as they're spoken. */
export const Intro: React.FC<{ scene: SceneTimeline }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const shown = WORDS.map(([w], i) => useGrow(wordFrame(scene, w, 0, 150 + i * 15), 12));
  return (
    <AbsoluteFill>
      <Stage camera={{ position: [5.2, -1.0, 7.2], fov: 40 }} lookAt={[0.2, 0.9, 1.6]}>
        <CloudField speed={4} count={14} seed="ep8-intro" />
        <Airplane fan={t * 30} />
      </Stage>
      <IntroTitle series="Flying Made Simple" episode={8} title="How Does a Jet Engine Work?" subtitle="Four words: suck, squeeze, bang, blow 🔥" grow={useGrow(8, 12)} sub={useGrow(28, 200)} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 170, display: "flex", justifyContent: "center", gap: 26 }}>
        {WORDS.map(([w, c], i) => (
          <div key={w} style={{ fontFamily: "system-ui", fontWeight: 900, fontSize: 64, color: "white", background: c, padding: "8px 30px", borderRadius: 18, opacity: shown[i], transform: `scale(${0.6 + 0.4 * (shown[i] ?? 0)})`, textTransform: "uppercase" }}>
            {w}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
