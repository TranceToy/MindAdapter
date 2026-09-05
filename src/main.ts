import './styles/antechamber.css';
import { detectCapabilities } from './gate/detect-capabilities';
import { diagnose } from './gate/diagnose';
import { renderGate } from './gate/gate-screen';
import { renderPlaceholder } from './placeholder-screen';
import { registerServiceWorker } from './register-service-worker';
import { createSurfaceHost } from './shell/surface-host';

const root = document.getElementById('app') as HTMLElement;
const host = createSurfaceHost(root);
const capabilities = detectCapabilities();
const diagnosis = diagnose(capabilities);
const firstSurface = diagnosis ? renderGate(diagnosis) : renderPlaceholder();

host.show(firstSurface);
registerServiceWorker();
