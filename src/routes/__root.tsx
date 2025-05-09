import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import { ConvexQueryClient } from '@convex-dev/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { HeroUIProviderWithNav } from '@/integrations/heroui/provider-with-nav'
import { DEFAULT_THEME_MODE } from '@/constants'
import { ClerkProvider, useAuth } from '@clerk/tanstack-react-start'
import { ConvexProviderWithClerk } from 'convex/react-clerk'

import appCss from '../styles.css?url'
import { convexQueryClient } from '@/router'
import { authStateFn } from '@/integrations/clerk/auth'
import { BaseLayout } from '@/components/layouts'

interface RouterContext {
  queryClient: QueryClient
  convexClient: ConvexQueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: `${import.meta.env.VITE_APP_TITLE}`,
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

  beforeLoad: async (ctx) => {
    const { user, token } = await authStateFn()
    if (token) {
      ctx.context.convexClient.serverHttpClient?.setAuth(token)
    }
    return { user }
  },

  component: () => (
    <RootDocument>
      <ClerkProvider>
        <ConvexProviderWithClerk
          client={convexQueryClient.convexClient}
          useAuth={useAuth}
        >
          <HeroUIProviderWithNav>
            <BaseLayout>
              <Outlet />
            </BaseLayout>
            {/* <TanStackRouterDevtools />
            <ReactQueryDevtools buttonPosition="bottom-right" /> */}
          </HeroUIProviderWithNav>
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </RootDocument>
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
