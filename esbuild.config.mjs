import { build } from 'esbuild';
import { cp, rm } from 'fs/promises';

await rm('dist', { recursive: true, force: true });

await build({
  entryPoints: ['src/background.ts'],
  outdir: 'dist',
  platform: 'browser',
  target: 'chrome133',
  format: 'esm',
  loader: {
    '.ts': 'ts',
  },
  bundle: true,
  minify: true,
  sourcemap: false,
});

await cp('src/manifest.json', 'dist/manifest.json');
await cp('src/assets', 'dist/assets', { recursive: true });
