import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import { codecovVitePlugin } from "@codecov/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "heroui-asamasterson.com",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  // vite-plugin-ssg reads this when running `vite-ssg build`
  // to know which routes to pre-render as static HTML.
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    // Pre-render these routes into separate index.html files.
    // Each file will have the Helmet tags already baked in.
    includedRoutes() {
      return ['/', '/about']
    },
  },
})
