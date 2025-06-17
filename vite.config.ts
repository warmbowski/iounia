import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'

export default defineConfig({
  ssr: {
    noExternal: ['@clerk/tanstack-react-start', '@tanstack/react-start'],
  },
  server: {
    port: 3000,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({ target: 'netlify' }),
  ],
  // build: {
  //   minify: false,
  //   terserOptions: {
  //     compress: false,
  //     mangle: false,
  //   },
  // },
})
