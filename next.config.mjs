import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin file-tracing to this project so stray lockfiles elsewhere on the
  // machine don't confuse Next's workspace-root inference.
  outputFileTracingRoot: __dirname,
  // Keep it lean. Add image domains / headers here as the app grows.
};

export default nextConfig;
