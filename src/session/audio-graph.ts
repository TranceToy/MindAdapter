import { pinnedToMono } from './audio-invariant';

export type AudioGraph = {
  merger: ChannelMergerNode;
  bed: GainNode;
  voice: GainNode;
  snap: GainNode;
  master: GainNode;
};

const BED_EARS = 2;

// One master under all three is safe: Web Audio mixes at node inputs, so a
// mono clip is up-mixed onto a two-channel input and summed per channel, and the
// bed's ears never meet.
export function createAudioGraph(context: AudioContext): AudioGraph {
  const graph: AudioGraph = {
    merger: context.createChannelMerger(BED_EARS),
    bed: context.createGain(),
    voice: context.createGain(),
    snap: context.createGain(),
    master: context.createGain(),
  };
  connect(context, graph);
  refuseMono(graph);
  return graph;
}

function connect(context: AudioContext, graph: AudioGraph): void {
  graph.merger.connect(graph.bed);
  graph.bed.connect(graph.master);
  graph.voice.connect(graph.master);
  // The snap sits beside the voice rather than under it: the two sound at once
  // where a marked word lands under a suggestion, and a track carrying both
  // would put the sum of them through one calibrated level.
  graph.snap.connect(graph.master);
  // destination.channelCount is left alone: its default is already the device's
  // own count, and pinning it only adds a way to be wrong.
  graph.master.connect(context.destination);
}

// The invariant, at the point the graph is constructed. The merger is exempt
// because the platform defines its inputs as one explicit channel each — that is
// what makes it a merger — and the destination because a mono device is a
// warning rather than a defect (§6.5).
function refuseMono(graph: AudioGraph): void {
  const pinned = pinnedToMono({
    bed: graph.bed,
    voice: graph.voice,
    snap: graph.snap,
    master: graph.master,
  });
  if (pinned.length === 0) return;
  throw new Error(`Audio graph pinned to mono: ${pinned.join(', ')}`);
}
