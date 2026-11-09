import { Composition } from "remotion";
import { Main, mainSchemaDefaults, type MainProps } from "./Main";
import { HowPlanesFly, type HowPlanesFlyProps } from "./aviation/HowPlanesFly";
import { FPS as AVIATION_FPS, loadTimeline, totalFrames } from "./aviation/timeline";

export const FPS = 30;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HowPlanesFly"
        component={HowPlanesFly}
        fps={AVIATION_FPS}
        width={1920}
        height={1080}
        durationInFrames={AVIATION_FPS * 60}
        defaultProps={{ timeline: [] } satisfies HowPlanesFlyProps}
        calculateMetadata={async () => {
          const timeline = await loadTimeline();
          return { durationInFrames: totalFrames(timeline), props: { timeline } };
        }}
      />
      <Composition
        id="Main"
        component={Main}
        durationInFrames={FPS * 8}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={mainSchemaDefaults satisfies MainProps}
      />
    </>
  );
};
