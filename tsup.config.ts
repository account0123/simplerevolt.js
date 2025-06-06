import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  dts: true,
  outDir: "lib",
  format: ["cjs", "esm"],
  clean: true,
});
