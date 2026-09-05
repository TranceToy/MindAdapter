const TARGET_RMS = 0.1;
const PEAK_CEILING = 0.99;

export type ClipMeasurement = {
  rmsScalar: number;
  peak: number;
  duration: number;
};

export function measureClip(buffer: AudioBuffer): ClipMeasurement | null {
  let squares = 0;
  let samples = 0;
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
    const data = buffer.getChannelData(channel);
    for (const sample of data) {
      squares += sample * sample;
      const magnitude = Math.abs(sample);
      if (magnitude > peak) peak = magnitude;
    }
    samples += data.length;
  }
  if (samples === 0) return null;
  const rms = Math.sqrt(squares / samples);
  if (rms === 0) return null;
  const backedOff = Math.min(TARGET_RMS / rms, PEAK_CEILING / peak);
  return { rmsScalar: backedOff, peak, duration: buffer.duration };
}
