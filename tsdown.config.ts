import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/cli/index.ts'],
  format: ['esm'],
  target: 'node20',
  outDir: 'dist/cli',
  clean: true,
  minify: true,
  sourcemap: false,
  dts: false,
  external: ['better-sqlite3'],
  banner: {    
  },
});
