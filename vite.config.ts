import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dsv from "@rollup/plugin-dsv";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [dsv(), svelte()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "src/lib/"),
      $componentsk: path.resolve(__dirname, "/lib/components"),
      $forceMap: path.resolve(__dirname, "src/forceMap/"),
      $utils: path.resolve(__dirname, "src/utils/"),
    },
  },
});
