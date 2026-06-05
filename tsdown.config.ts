import { defineConfig } from "tsdown";

function formatBuildTime(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}.${mm}${dd}.${hh}${min}`;
}

export default defineConfig({
  entry: ["src/cli/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist/cli",
  clean: true,
  minify: true,
  sourcemap: false,
  dts: false,
  define: {
    "process.env.BUILD_TIME": JSON.stringify(formatBuildTime(new Date())),
  },
  deps: {
    neverBundle: ["better-sqlite3"],
  },
  banner: {},
});
