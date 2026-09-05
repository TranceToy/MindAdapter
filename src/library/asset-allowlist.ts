const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
const AUDIO_EXTENSIONS = ['wav', 'mp3', 'm4a', 'ogg', 'opus', 'flac'];

export type AssetKind = 'image' | 'audio';

export function isAsset(fileName: string, kind: AssetKind): boolean {
  const dot = fileName.lastIndexOf('.');
  if (dot < 1) return false;
  const extension = fileName.slice(dot + 1).toLowerCase();
  const allowed = kind === 'image' ? IMAGE_EXTENSIONS : AUDIO_EXTENSIONS;
  return allowed.includes(extension);
}
