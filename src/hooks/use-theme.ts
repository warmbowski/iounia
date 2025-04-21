/**
 * Isomorphic version of https://github.com/heroui-inc/heroui/blob/canary/packages/hooks/use-theme/src/index.ts
 */
import { useCallback, useEffect, useState } from 'react'

// constant properties for Theme
export const ThemeProps = {
  // localStorage key for storing the current theme
  KEY: 'heroui-theme',
  // light theme
  LIGHT: 'light',
  // dark theme
  DARK: 'dark',
  // system theme
  SYSTEM: 'system',
} as const

// type definition for Theme using system theme names or custom theme names
export type customTheme = string
export type Theme =
  | typeof ThemeProps.LIGHT
  | typeof ThemeProps.DARK
  | typeof ThemeProps.SYSTEM
  | customTheme

/**
 * React hook to switch between themes
 *
 * @param defaultTheme the default theme name (e.g. light, dark, purple-dark and etc)
 * @returns An object containing the current theme and theme manipulation functions
 */
export function useTheme(
  defaultTheme: Theme = ThemeProps.SYSTEM,
  key: string = ThemeProps.KEY,
) {
  const MEDIA = '(prefers-color-scheme: dark)'

  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme
    }

    const storedTheme = localStorage.getItem(key) as Theme | null

    // return stored theme if it is selected previously
    if (storedTheme) return storedTheme

    // if it is using system theme, check `prefers-color-scheme` value
    // return light theme if not specified
    if (defaultTheme === ThemeProps.SYSTEM) {
      return window.matchMedia?.(MEDIA).matches
        ? ThemeProps.DARK
        : ThemeProps.LIGHT
    }

    return defaultTheme
  })

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (typeof window === 'undefined') return

      const targetTheme =
        newTheme === ThemeProps.SYSTEM
          ? window.matchMedia?.(MEDIA).matches
            ? ThemeProps.DARK
            : ThemeProps.LIGHT
          : newTheme

      localStorage.setItem(key, newTheme)

      document.documentElement.className = ''
      document.documentElement.classList.add(targetTheme)
      setThemeState(targetTheme)
    },
    [theme],
  )

  const handleMediaQuery = useCallback(
    (e: MediaQueryListEvent | MediaQueryList) => {
      if (defaultTheme === ThemeProps.SYSTEM) {
        setTheme(e.matches ? ThemeProps.DARK : ThemeProps.LIGHT)
      }
    },
    [setTheme],
  )

  useEffect(() => setTheme(theme), [theme, setTheme])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(MEDIA)

    media.addEventListener('change', handleMediaQuery)

    return () => media.removeEventListener('change', handleMediaQuery)
  }, [handleMediaQuery])

  return { theme, setTheme }
}
