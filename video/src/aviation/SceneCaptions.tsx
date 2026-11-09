import { createTikTokStyleCaptions, type TikTokPage } from "@remotion/captions";
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { LEAD_IN_FRAMES, type Word } from "./timeline";

const PAGE_MS = 1400;

/** Word-highlighted captions for one scene's narration. */
export const SceneCaptions: React.FC<{ words: Word[] }> = ({ words }) => {
  const { fps } = useVideoConfig();
  const pages = useMemo(
    () =>
      createTikTokStyleCaptions({
        captions: words.map((w, i) => ({
          text: i === 0 ? w.text : ` ${w.text}`,
          startMs: w.startMs,
          endMs: w.endMs,
          timestampMs: (w.startMs + w.endMs) / 2,
          confidence: null,
        })),
        combineTokensWithinMilliseconds: PAGE_MS,
      }).pages,
    [words],
  );
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, i) => {
        const next = pages[i + 1];
        const from = LEAD_IN_FRAMES + Math.floor((page.startMs / 1000) * fps);
        const endMs = next ? next.startMs : page.startMs + page.durationMs + 300;
        const duration = Math.max(1, Math.ceil(((endMs - page.startMs) / 1000) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={duration} layout="none">
            <Page page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const Page: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = page.startMs + (frame / fps) * 1000;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}>
      <div
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: 58,
          fontWeight: 800,
          color: "white",
          background: "rgba(8,20,40,0.72)",
          padding: "14px 34px",
          borderRadius: 20,
          whiteSpace: "pre",
        }}
      >
        {page.tokens.map((tok) => (
          <span key={tok.fromMs} style={{ color: tok.fromMs <= nowMs && nowMs < tok.toMs ? "#ffd84a" : "white" }}>
            {tok.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};
