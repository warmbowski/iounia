import { defineConfig } from '@tanstack/react-start/config'
import viteTsConfigPaths from 'vite-tsconfig-paths'
// import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  server: {
    preset: 'netlify',
    esbuild: {
      options: {
        target: 'es2022', // browsers can handle es2022 features
      },
    },
  },
  tsr: {
    appDirectory: 'src',
  },
  vite: {
    plugins: [
      // this is the plugin that enables path aliases
      viteTsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
      // BUG: removed tailwindcss vite plugin to avoid hydration mismatch errors
      // TODO: remove code and uninstall plugin package if this fixes the hydration mismatch errors
      // NOTE: postcss config is still used for tailwindcss
      // tailwindcss(),
    ],
  },
})

export default config
