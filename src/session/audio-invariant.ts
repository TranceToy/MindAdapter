export type ChannelShape = {
  channelCount: number;
  channelCountMode: ChannelCountMode;
  channelInterpretation: ChannelInterpretation;
};

const STEREO = 2;

// ADR-0001's constraint in checkable form. Explicit channel counting is the only
// route to a downmix, and a downmix sums the bed's two ears into one flat tone
// with nothing visibly wrong, so anything off the stereo defaults counts as
// pinned — not only a literal count of one.
export function pinnedToMono(nodes: Record<string, ChannelShape>): string[] {
  const pinned: string[] = [];
  for (const [name, node] of Object.entries(nodes)) {
    if (keepsChannelsApart(node)) continue;
    pinned.push(name);
  }
  return pinned;
}

function keepsChannelsApart(node: ChannelShape): boolean {
  if (node.channelCountMode !== 'max') return false;
  if (node.channelInterpretation !== 'speakers') return false;
  return node.channelCount >= STEREO;
}
