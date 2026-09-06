import { actionSecondary } from './antechamber';
import { isInstalled } from './platform';

export const INSTALL_LINE = 'install for a window of its own';

let dismissed = false;

// Installation buys a window without browser chrome and nothing else: a tab
// runs every layer. So this is a line to dismiss, never a screen to get
// past, and once dismissed it stays gone for the rest of the launch.
export function installNudge(): HTMLElement | null {
  if (dismissed) return null;
  if (isInstalled()) return null;
  const line = actionSecondary(INSTALL_LINE, () => dismiss(line));
  line.classList.add('nudge');
  return line;
}

function dismiss(line: HTMLElement): void {
  dismissed = true;
  line.remove();
}
