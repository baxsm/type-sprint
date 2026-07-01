// wpm uses the standard 5-chars-per-word convention
export function computeWpm(charCount: number, elapsedMs: number): number {
  if (elapsedMs <= 0 || charCount <= 0) return 0;
  const minutes = elapsedMs / 60000;
  const words = charCount / 5;
  return Math.round(words / minutes);
}

export function computeAccuracy(correct: number, total: number): number {
  if (total <= 0) return 100;
  const pct = (correct / total) * 100;
  return Math.round(pct * 10) / 10;
}

// consistency is derived from how steady the wpm samples are.
// low variance relative to the mean means high consistency.
export function computeConsistency(wpmSamples: number[]): number {
  const samples = wpmSamples.filter((s) => s > 0);
  if (samples.length < 2) return 100;

  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  if (mean <= 0) return 100;

  const variance = samples.reduce((sum, s) => sum + (s - mean) ** 2, 0) / samples.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / mean;

  const consistency = Math.max(0, 100 - coefficientOfVariation * 100);
  return Math.round(consistency * 10) / 10;
}
