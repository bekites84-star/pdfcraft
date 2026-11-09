/** Smooth, deterministic "bumpy air" motion: a sum of sines at unrelated frequencies. */
export function bump(t: number, seed = 0): number {
  return (Math.sin(t * 11.3 + seed) * 0.5 + Math.sin(t * 7.1 + seed * 2.3) * 0.35 + Math.sin(t * 17.9 + seed * 0.7) * 0.15);
}
