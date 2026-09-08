const STEREO = 2;

// Read wherever the audio path is entered — at session start and again on every
// resume, whatever caused the pause. The value is fixed against the device the
// context was created against and the pause suspends that context rather than
// rebuilding it, so a resume onto a mono device can read stale. It is unreliable
// only in that direction.
export function isMono(destination: AudioDestinationNode): boolean {
  return destination.maxChannelCount < STEREO;
}

// The start screen has no context to read: the session's is not opened until
// the Start click, and the line has to be said before it. So the question is
// asked of a context opened and closed for the question alone.
//
// The other candidate was calibration, where audio already exists and no second
// context is needed. It was rejected because calibration runs only until levels
// are stored: every launch after the first goes library to selection to start
// without it, and a reading taken there would be the one launch in many that a
// device was ever asked about. A probe costs a context per visit to the start
// screen and reads the device as it stands, which is the reading with the
// shortest way to go stale.
export function probeMono(): boolean {
  const context = openProbe();
  if (!context) return false;
  const mono = isMono(context.destination);
  void context.close();
  return mono;
}

// A browser that refuses a context here says nothing about the output, and the
// Start click has its own refusal to report — so an unanswered question is
// carried as no line rather than as a warning nobody can act on.
function openProbe(): AudioContext | null {
  try {
    return new AudioContext();
  } catch {
    return null;
  }
}
