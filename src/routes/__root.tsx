import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { HeroUIProviderWithNav } from '@/integrations/heroui/provider-with-nav'
import { APP_TITLE, DEFAULT_THEME_MODE } from '@/constants'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

import appCss from '../styles.css?url'
import { convexQueryClient } from '@/router'
import { ToastProvider } from '@heroui/react'
import { authStateFn } from '@/integrations/clerk/auth'

interface RouterContext {
  queryClient: QueryClient
  convexQueryClient: ConvexQueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: `${APP_TITLE}`,
      },
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'stylesheet preload',
        as: 'style',
        href: 'https://fonts.googleapis.com/css2?family=Outfit&display=optional',
      },
    ],
    scripts: [
      {
        className: 'theme-init',
        children: themeInitScript,
      },
    ],
  }),

  beforeLoad: async ({ context }) => {
    const { user, token } = await authStateFn()
    if (token) {
      console.log('Setting auth token for Convex:', !!token)
      context.convexQueryClient.serverHttpClient?.setAuth(token)
    }
    return { user }
  },

  component: () => (
    <ClerkProvider>
      <RootDocument>
        <ConvexProviderWithClerk
          client={convexQueryClient.convexClient}
          useAuth={useAuth}
        >
          <HeroUIProviderWithNav>
            <ToastProvider />
            <Outlet />
            <ReactQueryDevtools buttonPosition="bottom-right" />
            {/* <TanStackRouterDevtools /> */}
          </HeroUIProviderWithNav>
        </ConvexProviderWithClerk>
      </RootDocument>
    </ClerkProvider>
  ),
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={DEFAULT_THEME_MODE} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="text-foreground bg-background">
        {children}
        <Scripts />
      </body>
    </html>
  )
}

const themeInitScript = `
  (function () {
    try {
      var mode = localStorage.getItem('heroui-theme');
      var supportDarkMode =
        window.matchMedia('(prefers-color-scheme: dark)').matches === true;
      if (!mode) {
        if (supportDarkMode) {
          document.documentElement.className = ''
          document.documentElement.classList.add('dark')
          return
        }
        return
      }

      document.documentElement.className = ''
      document.documentElement.classList.add(mode)
    } catch (e) {}
  })();
`
