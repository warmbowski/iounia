/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as IndexImport } from './routes/index'
import { Route as AppIndexImport } from './routes/app/index'
import { Route as SsoCallbackImport } from './routes/sso.callback'
import { Route as AppCampaignIdRouteImport } from './routes/app/$campaignId/route'
import { Route as AppCampaignIdIndexImport } from './routes/app/$campaignId/index'
import { Route as AppCampaignIdSessionsImport } from './routes/app/$campaignId/sessions'
import { Route as AppCampaignIdSessionSessionIdImport } from './routes/app/$campaignId/session/$sessionId'
import { Route as AppCampaignIdSessionSessionIdRecordingsImport } from './routes/app/$campaignId/session/$sessionId.recordings'

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const AppIndexRoute = AppIndexImport.update({
  id: '/app/',
  path: '/app/',
  getParentRoute: () => rootRoute,
} as any)

const SsoCallbackRoute = SsoCallbackImport.update({
  id: '/sso/callback',
  path: '/sso/callback',
  getParentRoute: () => rootRoute,
} as any)

const AppCampaignIdRouteRoute = AppCampaignIdRouteImport.update({
  id: '/app/$campaignId',
  path: '/app/$campaignId',
  getParentRoute: () => rootRoute,
} as any)

const AppCampaignIdIndexRoute = AppCampaignIdIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AppCampaignIdRouteRoute,
} as any)

const AppCampaignIdSessionsRoute = AppCampaignIdSessionsImport.update({
  id: '/sessions',
  path: '/sessions',
  getParentRoute: () => AppCampaignIdRouteRoute,
} as any)

const AppCampaignIdSessionSessionIdRoute =
  AppCampaignIdSessionSessionIdImport.update({
    id: '/session/$sessionId',
    path: '/session/$sessionId',
    getParentRoute: () => AppCampaignIdRouteRoute,
  } as any)

const AppCampaignIdSessionSessionIdRecordingsRoute =
  AppCampaignIdSessionSessionIdRecordingsImport.update({
    id: '/recordings',
    path: '/recordings',
    getParentRoute: () => AppCampaignIdSessionSessionIdRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/app/$campaignId': {
      id: '/app/$campaignId'
      path: '/app/$campaignId'
      fullPath: '/app/$campaignId'
      preLoaderRoute: typeof AppCampaignIdRouteImport
      parentRoute: typeof rootRoute
    }
    '/sso/callback': {
      id: '/sso/callback'
      path: '/sso/callback'
      fullPath: '/sso/callback'
      preLoaderRoute: typeof SsoCallbackImport
      parentRoute: typeof rootRoute
    }
    '/app/': {
      id: '/app/'
      path: '/app'
      fullPath: '/app'
      preLoaderRoute: typeof AppIndexImport
      parentRoute: typeof rootRoute
    }
    '/app/$campaignId/sessions': {
      id: '/app/$campaignId/sessions'
      path: '/sessions'
      fullPath: '/app/$campaignId/sessions'
      preLoaderRoute: typeof AppCampaignIdSessionsImport
      parentRoute: typeof AppCampaignIdRouteImport
    }
    '/app/$campaignId/': {
      id: '/app/$campaignId/'
      path: '/'
      fullPath: '/app/$campaignId/'
      preLoaderRoute: typeof AppCampaignIdIndexImport
      parentRoute: typeof AppCampaignIdRouteImport
    }
    '/app/$campaignId/session/$sessionId': {
      id: '/app/$campaignId/session/$sessionId'
      path: '/session/$sessionId'
      fullPath: '/app/$campaignId/session/$sessionId'
      preLoaderRoute: typeof AppCampaignIdSessionSessionIdImport
      parentRoute: typeof AppCampaignIdRouteImport
    }
    '/app/$campaignId/session/$sessionId/recordings': {
      id: '/app/$campaignId/session/$sessionId/recordings'
      path: '/recordings'
      fullPath: '/app/$campaignId/session/$sessionId/recordings'
      preLoaderRoute: typeof AppCampaignIdSessionSessionIdRecordingsImport
      parentRoute: typeof AppCampaignIdSessionSessionIdImport
    }
  }
}

// Create and export the route tree

interface AppCampaignIdSessionSessionIdRouteChildren {
  AppCampaignIdSessionSessionIdRecordingsRoute: typeof AppCampaignIdSessionSessionIdRecordingsRoute
}

const AppCampaignIdSessionSessionIdRouteChildren: AppCampaignIdSessionSessionIdRouteChildren =
  {
    AppCampaignIdSessionSessionIdRecordingsRoute:
      AppCampaignIdSessionSessionIdRecordingsRoute,
  }

const AppCampaignIdSessionSessionIdRouteWithChildren =
  AppCampaignIdSessionSessionIdRoute._addFileChildren(
    AppCampaignIdSessionSessionIdRouteChildren,
  )

interface AppCampaignIdRouteRouteChildren {
  AppCampaignIdSessionsRoute: typeof AppCampaignIdSessionsRoute
  AppCampaignIdIndexRoute: typeof AppCampaignIdIndexRoute
  AppCampaignIdSessionSessionIdRoute: typeof AppCampaignIdSessionSessionIdRouteWithChildren
}

const AppCampaignIdRouteRouteChildren: AppCampaignIdRouteRouteChildren = {
  AppCampaignIdSessionsRoute: AppCampaignIdSessionsRoute,
  AppCampaignIdIndexRoute: AppCampaignIdIndexRoute,
  AppCampaignIdSessionSessionIdRoute:
    AppCampaignIdSessionSessionIdRouteWithChildren,
}

const AppCampaignIdRouteRouteWithChildren =
  AppCampaignIdRouteRoute._addFileChildren(AppCampaignIdRouteRouteChildren)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/app/$campaignId': typeof AppCampaignIdRouteRouteWithChildren
  '/sso/callback': typeof SsoCallbackRoute
  '/app': typeof AppIndexRoute
  '/app/$campaignId/sessions': typeof AppCampaignIdSessionsRoute
  '/app/$campaignId/': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRouteWithChildren
  '/app/$campaignId/session/$sessionId/recordings': typeof AppCampaignIdSessionSessionIdRecordingsRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/sso/callback': typeof SsoCallbackRoute
  '/app': typeof AppIndexRoute
  '/app/$campaignId/sessions': typeof AppCampaignIdSessionsRoute
  '/app/$campaignId': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRouteWithChildren
  '/app/$campaignId/session/$sessionId/recordings': typeof AppCampaignIdSessionSessionIdRecordingsRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/app/$campaignId': typeof AppCampaignIdRouteRouteWithChildren
  '/sso/callback': typeof SsoCallbackRoute
  '/app/': typeof AppIndexRoute
  '/app/$campaignId/sessions': typeof AppCampaignIdSessionsRoute
  '/app/$campaignId/': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRouteWithChildren
  '/app/$campaignId/session/$sessionId/recordings': typeof AppCampaignIdSessionSessionIdRecordingsRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/app/$campaignId'
    | '/sso/callback'
    | '/app'
    | '/app/$campaignId/sessions'
    | '/app/$campaignId/'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/$sessionId/recordings'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/sso/callback'
    | '/app'
    | '/app/$campaignId/sessions'
    | '/app/$campaignId'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/$sessionId/recordings'
  id:
    | '__root__'
    | '/'
    | '/app/$campaignId'
    | '/sso/callback'
    | '/app/'
    | '/app/$campaignId/sessions'
    | '/app/$campaignId/'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/$sessionId/recordings'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AppCampaignIdRouteRoute: typeof AppCampaignIdRouteRouteWithChildren
  SsoCallbackRoute: typeof SsoCallbackRoute
  AppIndexRoute: typeof AppIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AppCampaignIdRouteRoute: AppCampaignIdRouteRouteWithChildren,
  SsoCallbackRoute: SsoCallbackRoute,
  AppIndexRoute: AppIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/app/$campaignId",
        "/sso/callback",
        "/app/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/app/$campaignId": {
      "filePath": "app/$campaignId/route.tsx",
      "children": [
        "/app/$campaignId/sessions",
        "/app/$campaignId/",
        "/app/$campaignId/session/$sessionId"
      ]
    },
    "/sso/callback": {
      "filePath": "sso.callback.tsx"
    },
    "/app/": {
      "filePath": "app/index.tsx"
    },
    "/app/$campaignId/sessions": {
      "filePath": "app/$campaignId/sessions.tsx",
      "parent": "/app/$campaignId"
    },
    "/app/$campaignId/": {
      "filePath": "app/$campaignId/index.tsx",
      "parent": "/app/$campaignId"
    },
    "/app/$campaignId/session/$sessionId": {
      "filePath": "app/$campaignId/session/$sessionId.tsx",
      "parent": "/app/$campaignId",
      "children": [
        "/app/$campaignId/session/$sessionId/recordings"
      ]
    },
    "/app/$campaignId/session/$sessionId/recordings": {
      "filePath": "app/$campaignId/session/$sessionId.recordings.tsx",
      "parent": "/app/$campaignId/session/$sessionId"
    }
  }
}
ROUTE_MANIFEST_END */
