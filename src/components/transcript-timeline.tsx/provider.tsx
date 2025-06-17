import { convexQueryClient } from '@/router'
import { addToast } from '@heroui/react'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  PersistQueryClientProvider,
  type PersistedClient,
  type Persister,
} from '@tanstack/react-query-persist-client'
import type { Id } from 'convex/_generated/dataModel'
import { get, set, del, createStore } from 'idb-keyval'

const queryCacheLocalStore = createStore(
  'query-cache-store',
  'recording-transcripts',
)

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) {
        addToast({
          title: 'Error',
          description: `${error.message}`,
          color: 'danger',
        })
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Disable automatic refetching
      gcTime: 1000 * 60 * 60 * 24 * 21, // 21 days
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
})

export function PersistedRecordingTimelineProvider({
  cacheVersion,
  recordingId,
  children,
}: {
  cacheVersion: string
  recordingId: Id<'recordings'>
  children: React.ReactNode
}) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: createIDBPersister('recording-' + recordingId),
        buster: cacheVersion,
      }}
      onError={() => {
        console.error('Error restoring query client')
      }}
      onSuccess={() => {
        console.info('Initial restore of query client successful')
      }}
    >
      {children}
      <ReactQueryDevtools buttonPosition="bottom-left" />
    </PersistQueryClientProvider>
  )
}

/**
 * Creates an Indexed DB persister
 * @see https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
 */
export function createIDBPersister(idbValidKey: IDBValidKey = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client, queryCacheLocalStore)
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey, queryCacheLocalStore)
    },
    removeClient: async () => {
      await del(idbValidKey, queryCacheLocalStore)
    },
  } satisfies Persister
}
