import { AbsoluteFill, Audio, staticFile } from "remotion";
import { Scene } from "./scene/Scene";
import { Captions } from "./captions/Captions";

export type MainProps = {
  /** Path inside public/ to a captions JSON file (Remotion `Caption[]`), or null for none. */
  captionsFile: string | null;
  /** Path inside public/ to an audio file (mp3/wav/aac), or null for a silent video. */
  audioFile: string | null;
};

export const mainSchemaDefaults: MainProps = {
  captionsFile: "captions/example.json",
  audioFile: null,
};

export const Main: React.FC<MainProps> = ({ captionsFile, audioFile }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0b1020" }}>
      <Scene />
      {captionsFile ? <Captions file={captionsFile} /> : null}
      {audioFile ? <Audio src={staticFile(audioFile)} /> : null}
    </AbsoluteFill>
  );
};
