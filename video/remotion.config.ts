import { Config } from "@remotion/cli/config";

type GlRenderer = Parameters<typeof Config.setChromiumOpenGlRenderer>[0];

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// WebGL (Three.js) needs a GPU-capable GL backend in headless Chrome.
// "angle" works on most machines; use "swangle" (software) on servers without a GPU.
Config.setChromiumOpenGlRenderer((process.env.REMOTION_GL as GlRenderer | undefined) ?? "angle");
// Point at an existing Chrome headless shell if one is installed (optional).
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
