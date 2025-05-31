import { ensureViteEnvironmentVariable } from './utils'

export const DEFAULT_THEME_MODE = 'light'
export const THEME_LS_KEY = 'theme'
export const NO_PHOTOURL_URL =
  'https://ui-avatars.com/api/?background=random&name='
export const APP_TITLE = ensureViteEnvironmentVariable('VITE_APP_TITLE')
