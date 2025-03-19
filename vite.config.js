import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import postcss from "./postcss.config.js";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
  css: {
    postcss: postcss,
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["buffer", "process", "util", "stream", "zlib", "crypto"],
    }),
    commonjs({
      include: /node_modules/,
      requireReturnsDefault: "auto", // <---- this solves default issue
    }),
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      plugins: [
        nodePolyfills(), // Add it to rollupOptions as well for production build
      ],
    },
  },
  resolve: {
    alias: {
      // process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      crypto: "crypto-browserify",
    },
  },
});
