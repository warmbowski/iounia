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
import { Route as AppCampaignIdIndexImport } from './routes/app/$campaignId/index'
import { Route as AppCampaignIdChatImport } from './routes/app/$campaignId/chat'
import { Route as AppCampaignIdSessionSessionIdImport } from './routes/app/$campaignId/session/$sessionId'
import { Route as AppCampaignIdSessionRecordingRecordingIdImport } from './routes/app/$campaignId/session/recording.$recordingId'

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

const AppCampaignIdIndexRoute = AppCampaignIdIndexImport.update({
  id: '/app/$campaignId/',
  path: '/app/$campaignId/',
  getParentRoute: () => rootRoute,
} as any)

const AppCampaignIdChatRoute = AppCampaignIdChatImport.update({
  id: '/app/$campaignId/chat',
  path: '/app/$campaignId/chat',
  getParentRoute: () => rootRoute,
} as any)

const AppCampaignIdSessionSessionIdRoute =
  AppCampaignIdSessionSessionIdImport.update({
    id: '/app/$campaignId/session/$sessionId',
    path: '/app/$campaignId/session/$sessionId',
    getParentRoute: () => rootRoute,
  } as any)

const AppCampaignIdSessionRecordingRecordingIdRoute =
  AppCampaignIdSessionRecordingRecordingIdImport.update({
    id: '/app/$campaignId/session/recording/$recordingId',
    path: '/app/$campaignId/session/recording/$recordingId',
    getParentRoute: () => rootRoute,
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
    '/app/$campaignId/chat': {
      id: '/app/$campaignId/chat'
      path: '/app/$campaignId/chat'
      fullPath: '/app/$campaignId/chat'
      preLoaderRoute: typeof AppCampaignIdChatImport
      parentRoute: typeof rootRoute
    }
    '/app/$campaignId/': {
      id: '/app/$campaignId/'
      path: '/app/$campaignId'
      fullPath: '/app/$campaignId'
      preLoaderRoute: typeof AppCampaignIdIndexImport
      parentRoute: typeof rootRoute
    }
    '/app/$campaignId/session/$sessionId': {
      id: '/app/$campaignId/session/$sessionId'
      path: '/app/$campaignId/session/$sessionId'
      fullPath: '/app/$campaignId/session/$sessionId'
      preLoaderRoute: typeof AppCampaignIdSessionSessionIdImport
      parentRoute: typeof rootRoute
    }
    '/app/$campaignId/session/recording/$recordingId': {
      id: '/app/$campaignId/session/recording/$recordingId'
      path: '/app/$campaignId/session/recording/$recordingId'
      fullPath: '/app/$campaignId/session/recording/$recordingId'
      preLoaderRoute: typeof AppCampaignIdSessionRecordingRecordingIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/sso/callback': typeof SsoCallbackRoute
  '/app': typeof AppIndexRoute
  '/app/$campaignId/chat': typeof AppCampaignIdChatRoute
  '/app/$campaignId': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRoute
  '/app/$campaignId/session/recording/$recordingId': typeof AppCampaignIdSessionRecordingRecordingIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/sso/callback': typeof SsoCallbackRoute
  '/app': typeof AppIndexRoute
  '/app/$campaignId/chat': typeof AppCampaignIdChatRoute
  '/app/$campaignId': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRoute
  '/app/$campaignId/session/recording/$recordingId': typeof AppCampaignIdSessionRecordingRecordingIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/sso/callback': typeof SsoCallbackRoute
  '/app/': typeof AppIndexRoute
  '/app/$campaignId/chat': typeof AppCampaignIdChatRoute
  '/app/$campaignId/': typeof AppCampaignIdIndexRoute
  '/app/$campaignId/session/$sessionId': typeof AppCampaignIdSessionSessionIdRoute
  '/app/$campaignId/session/recording/$recordingId': typeof AppCampaignIdSessionRecordingRecordingIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/sso/callback'
    | '/app'
    | '/app/$campaignId/chat'
    | '/app/$campaignId'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/recording/$recordingId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/sso/callback'
    | '/app'
    | '/app/$campaignId/chat'
    | '/app/$campaignId'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/recording/$recordingId'
  id:
    | '__root__'
    | '/'
    | '/sso/callback'
    | '/app/'
    | '/app/$campaignId/chat'
    | '/app/$campaignId/'
    | '/app/$campaignId/session/$sessionId'
    | '/app/$campaignId/session/recording/$recordingId'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  SsoCallbackRoute: typeof SsoCallbackRoute
  AppIndexRoute: typeof AppIndexRoute
  AppCampaignIdChatRoute: typeof AppCampaignIdChatRoute
  AppCampaignIdIndexRoute: typeof AppCampaignIdIndexRoute
  AppCampaignIdSessionSessionIdRoute: typeof AppCampaignIdSessionSessionIdRoute
  AppCampaignIdSessionRecordingRecordingIdRoute: typeof AppCampaignIdSessionRecordingRecordingIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  SsoCallbackRoute: SsoCallbackRoute,
  AppIndexRoute: AppIndexRoute,
  AppCampaignIdChatRoute: AppCampaignIdChatRoute,
  AppCampaignIdIndexRoute: AppCampaignIdIndexRoute,
  AppCampaignIdSessionSessionIdRoute: AppCampaignIdSessionSessionIdRoute,
  AppCampaignIdSessionRecordingRecordingIdRoute:
    AppCampaignIdSessionRecordingRecordingIdRoute,
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
        "/sso/callback",
        "/app/",
        "/app/$campaignId/chat",
        "/app/$campaignId/",
        "/app/$campaignId/session/$sessionId",
        "/app/$campaignId/session/recording/$recordingId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/sso/callback": {
      "filePath": "sso.callback.tsx"
    },
    "/app/": {
      "filePath": "app/index.tsx"
    },
    "/app/$campaignId/chat": {
      "filePath": "app/$campaignId/chat.tsx"
    },
    "/app/$campaignId/": {
      "filePath": "app/$campaignId/index.tsx"
    },
    "/app/$campaignId/session/$sessionId": {
      "filePath": "app/$campaignId/session/$sessionId.tsx"
    },
    "/app/$campaignId/session/recording/$recordingId": {
      "filePath": "app/$campaignId/session/recording.$recordingId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
