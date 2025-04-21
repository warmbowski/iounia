/**
 * customize navigation in HeroUIProvider to use tanstack router
 * link for info: https://www.heroui.com/docs/guide/routing#tanstack
 */

import type { NavigateOptions, ToOptions } from '@tanstack/react-router'

import { useRouter } from '@tanstack/react-router'
import { HeroUIProvider } from '@heroui/react'

/**
 * hoist this package via .npmrc for typescript to find it
 * link for info: https://pnpm.io/blog/2020/10/17/node-modules-configuration-options-with-pnpm#the-default-setup
 */
declare module '@react-types/shared' {
  interface RouterConfig {
    href: ToOptions['to']
    routerOptions: Omit<NavigateOptions, keyof ToOptions>
  }
}

export function HeroUIProviderWithNav({
  children,
}: {
  children: React.ReactNode
}) {
  let router = useRouter()

  return (
    <HeroUIProvider
      navigate={(to, options) => router.navigate({ to, ...options })}
      useHref={(to) => router.buildLocation({ to }).href}
    >
      {children}
    </HeroUIProvider>
  )
}
