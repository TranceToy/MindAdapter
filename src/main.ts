import './styles/antechamber.css';
import { detectCapabilities } from './gate/detect-capabilities';
import { diagnose } from './gate/diagnose';
import { renderGate } from './gate/gate-screen';
import { runLibraryStep } from './library/library-step';
import { registerServiceWorker } from './register-service-worker';
import { createSurfaceHost } from './shell/surface-host';

const root = document.getElementById('app') as HTMLElement;
const host = createSurfaceHost(root);
const capabilities = detectCapabilities();
const diagnosis = diagnose(capabilities);

if (diagnosis) {
  const gate = renderGate(diagnosis);
  host.show(gate);
} else {
  void runLibraryStep(host);
}

registerServiceWorker();
