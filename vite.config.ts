import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dsv from "@rollup/plugin-dsv";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [dsv(), svelte()],
  resolve: {
    alias: {
      $lib: path.resolve("./src/lib/*"),
    },
  },
});
