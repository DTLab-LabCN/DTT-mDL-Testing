import GlobalPolyFill, { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import postcss from './postcss.config.js'
import NodeModulesPolyfillPlugin from "@esbuild-plugins/node-modules-polyfill";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import commonjs from "vite-plugin-commonjs";

export default defineConfig({
    css: {
      postcss: postcss,
    },
    plugins: [react(),
        NodeGlobalsPolyfillPlugin({
            buffer: true,
            process: true,
          }),
          nodePolyfills(),
          NodeModulesPolyfillPlugin(),
          commonjs({
            include: /node_modules/,
            requireReturnsDefault: 'auto', // <---- this solves default issue
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
            process: 'rollup-plugin-node-polyfills/polyfills/process-es6.js',
            stream: "stream-browserify",
            zlib: "browserify-zlib",
            util: "util",
            crypto: "crypto-browserify",
            Buffer:'buffer'
        },
    },
});