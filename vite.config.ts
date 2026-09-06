import { defineConfig } from 'vite';

// Served from https://trancetoy.github.io/MindAdapter/, so every built URL
// carries that prefix. The manifest and the service worker are copied verbatim
// out of public/ and have to carry it themselves.
export default defineConfig({
  base: '/MindAdapter/',
});
