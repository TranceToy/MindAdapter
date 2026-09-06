const DECODE_SAMPLE_RATE = 44100;

export function createDecoder(): OfflineAudioContext {
  return new OfflineAudioContext(1, 1, DECODE_SAMPLE_RATE);
}

export async function decodeClip(
  context: BaseAudioContext,
  handle: FileSystemFileHandle,
): Promise<AudioBuffer | null> {
  try {
    const file = await handle.getFile();
    const bytes = await file.arrayBuffer();
    return await context.decodeAudioData(bytes);
  } catch {
    return null;
  }
}
